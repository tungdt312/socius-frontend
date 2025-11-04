"use server"
import {clearToken, globalState, setToken} from "@/lib/token";
import {TokenResponse} from "@/types/apis/auth";
import {redirect} from "next/navigation";

const EXTERNAL_BASE = process.env.API_BASE_URL!;

export async function callExternalApi(
    url: string,
    needAuth: boolean = false,
    req?: Request,
): Promise<Response> {
    const accessToken = globalState.accessToken;
    const refreshToken = globalState.refreshToken;
    if ((!accessToken || !refreshToken) && needAuth) {
        return Response.json(
            {message: "Thiếu token, cần đăng nhập lại"},
            {status: 403}
        );
    }
    const headers = {
        "Content-Type": "application/json",
        ...(needAuth && accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
    };
    const body = req?.body ? await req.text() : undefined;

    try {
        const res: Response = await fetch(`${EXTERNAL_BASE}${url}`, {
            method: req?.method ?? "POST",
            headers: headers,
            body: body,
        })
        if (!res.ok) {
            if (res.status === 403 && refreshToken) {
                const refreshRes = await fetch(`${EXTERNAL_BASE}/auth/refresh`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({refreshToken}),
                });

                if (refreshRes.ok) {
                    const newTokens: TokenResponse = await refreshRes.json();
                    setToken(newTokens.accessToken, newTokens.refreshToken);

                    // Thử lại request với token mới
                    return await callExternalApi(url, needAuth, req);
                } else {
                    clearToken()
                    return Response.json(
                        {message: "Thiếu token, cần đăng nhập lại"},
                        {status: 403}
                    );
                }
            }
        }
        const data = await res.json();
        return Response.json(data, {status: res.status});
    } catch (error: any) {
        throw new Error(error.message ?? "Lỗi server hoặc kết nối API thất bại");
    }
}