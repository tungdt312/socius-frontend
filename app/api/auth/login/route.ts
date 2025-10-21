// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/cookie";
import {LoginResponse, RegisterResponse} from "@/types/api";
import {callExternalApi} from "@/lib/fetcher";

const EXTERNAL_BASE = process.env.API_BASE_URL!;
const PATH = "/auth/login";

export async function POST(req: Request) {
    const body = await req.json();
    const { data, status, ok } = await callExternalApi<LoginResponse>(PATH, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    });
    if (!ok) return NextResponse.json({ error: "Đăng nhập thất bại" }, { status });
    if (data && data.token){
        const response = NextResponse.json({ ok: true});
        console.log(data.token.accessToken);
        setAuthCookies(response, data.token.accessToken, data.token.refreshToken);
    }

    return NextResponse.json({data, ok});
}
