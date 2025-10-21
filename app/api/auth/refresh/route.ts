// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies, clearAuthCookies } from "@/lib/cookie";
import {RegisterResponse, TokenResponse} from "@/types/api";
import {callExternalApi} from "@/lib/fetcher";
const PATH = "/auth/refresh";

export async function POST(req: NextRequest) {
    // read refresh_token from cookie
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
        return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const { data, status, ok } = await callExternalApi<TokenResponse>(PATH, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({refreshToken: refreshToken}),
    });
    if (!ok) {
        // clear tokens
        const response = NextResponse.json({ error: "Refresh token không hợp lệ" }, { status });
        clearAuthCookies(response);
        return response;
    }

    if(data){
    const response = NextResponse.json({ ok: true});
    // maybe external returns new refresh token (rotation)
    setAuthCookies(response, data.accessToken, data.refreshToken ?? refreshToken);
    }
    return NextResponse.json({ ok: true });
}
