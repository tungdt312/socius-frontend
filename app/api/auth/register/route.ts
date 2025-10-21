import {NextResponse} from "next/server";
import {RegisterResponse} from "@/types/api";
import {callExternalApi} from "@/lib/fetcher";

const PATH = "/auth/register";

export async function POST(req: Request) {
    const body = await req.json();
    const { data, status, ok } = await callExternalApi<RegisterResponse>(PATH, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    });
    if (!ok) return NextResponse.json({ error: data?.message ?? "Đăng ký thất bại" }, { status });
    return NextResponse.json({ ok: true});

}