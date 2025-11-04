"use server"
import {clearToken, globalState, setToken} from "@/lib/token";
import {TokenResponse} from "@/types/dtos/auth";
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
    } catch (error) {
        throw new Error( "Lỗi server hoặc kết nối API thất bại");
    }
}


// Server Action này được gọi từ form
export async function updateUserProfile(formData: FormData) {
    const accessToken = globalState.accessToken;
    const refreshToken = globalState.refreshToken;

    if (!accessToken || !refreshToken) {
        return { error: "Thiếu token, cần đăng nhập lại", status: 403 };
    }

    let headers = {
        "accept": "*/*",
        "Authorization": `Bearer ${accessToken}`,
        // KHÔNG set "Content-Type"
    };

    try {
        let res = await fetch(`${EXTERNAL_BASE}/v1/users/me`, {
            method: "PUT",
            headers: headers,
            body: formData,
        });

        if (!res.ok) {
            if (res.status === 403 && refreshToken) {
                // Thử refresh token
                const refreshRes = await fetch(`${EXTERNAL_BASE}/auth/refresh`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({refreshToken}),
                });

                if (refreshRes.ok) {
                    const newTokens: TokenResponse = await refreshRes.json();
                    setToken(newTokens.accessToken, newTokens.refreshToken);

                    // Thử lại với token MỚI
                    headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
                    res = await fetch(`${EXTERNAL_BASE}/v1/users/me`, {
                        method: "PUT",
                        headers: headers,
                        body: formData, // FormData có thể được gửi lại (không giống stream)
                    });
                } else {
                    clearToken();
                    return { error: "Phiên đăng nhập hết hạn", status: 403 };
                }
            }
        }

        if (!res.ok) {
            console.log(res.status)
            return { error: "Lỗi cập nhật", status: res.status };
        }

        const data = await res.json();
        console.log(data)
        return { data: data, status: res.status };

    } catch (error) {
        console.error("Lỗi Server Action:", error);
        return { error: "Lỗi server hoặc kết nối API thất bại", status: 500 };
    }
}