// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies, clearAuthCookies } from "@/lib/cookie";

const EXTERNAL_BASE = process.env.API_BASE_URL!;
const REFRESH_PATH = "/auth/refresh";

export async function POST(req: NextRequest) {
    // read refresh_token from cookie
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
        return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const res = await fetch(`${EXTERNAL_BASE}${REFRESH_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        // clear tokens
        const response = NextResponse.json({ error: "Refresh token không hợp lệ" }, { status: res.status });
        clearAuthCookies(response);
        return response;
    }

    const response = NextResponse.json({ ok: true, accessToken: data.accessToken });
    // maybe external returns new refresh token (rotation)
    setAuthCookies(response, data.accessToken, data.refreshToken ?? refreshToken);
    return response;
}
