// app/api/auth/refresh/route.ts
import {NextRequest, NextResponse} from "next/server";
import {TokenResponse} from "@/types/apis/auth";
import {callExternalApi} from "@/lib/fetcher";
import {clearToken, setToken} from "@/lib/token";
import {cookies} from "next/headers";

const PATH = "/auth/refresh";

export async function POST(req: Request) {
    // read refresh_token from cookie
    try {
        const refreshToken = (await cookies()).get("refreshToken")?.value;
        if (!refreshToken) {
            console.error("Refresh token is missing");
            return Response.json(
                {message: "Lỗi token"},
                {status: 404}
            );
        }

        const res = await callExternalApi(PATH,);
        const {ok} = res;
        const data: TokenResponse = await res.json();
        if (!ok) {
            await clearToken();
            return Response.redirect("/sign-in");
        }
        if (data) {
            await setToken(data.accessToken, data.refreshToken ?? refreshToken);
        }
        return Response.json(data);
    } catch (error) {
        console.error("Lỗi refresh:", error);
        return Response.json(
            {message: "Lỗi server hoặc kết nối API thất bại"},
            {status: 500}
        );
    }
}
