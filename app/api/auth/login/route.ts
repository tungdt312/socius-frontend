// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/cookie";

const EXTERNAL_BASE = process.env.API_BASE_URL!;
const LOGIN_PATH = "/auth/login";

export async function POST(req: Request) {
    const body = await req.json();
    // body: { username, password } (frontend gửi)
    const res = await fetch(`${EXTERNAL_BASE}${LOGIN_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        // forward error message
        return NextResponse.json({ error: data?.message ?? "Đăng nhập thất bại" }, { status: res.status });
    }

    const response = NextResponse.json({ ok: true, user: data.user ?? null });
    // set cookies
    if (data.accessToken){
        console.log(data.accessToken);
        setAuthCookies(response, data.accessToken, data.refreshToken);
    }

    return response;
}
