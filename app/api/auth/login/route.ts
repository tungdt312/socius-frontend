// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/cookie";

const EXTERNAL_BASE = process.env.API_BASE_URL!;
const PATH = "/auth/login";

export async function POST(req: Request) {
    const body = await req.json();
    // body: { username, password } (frontend gửi)
    const res = await fetch(`${EXTERNAL_BASE}${PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        // forward error message
        return NextResponse.json({ error: data?.message ?? "Đăng nhập thất bại" }, { status: res.status });
    }

    const response = NextResponse.json(data);
    // set cookies
    if (data.token != null){
        console.log(data.token.accessToken);
        setAuthCookies(response, data.token.accessToken, data.token.refreshToken);
    }

    return response;
}
