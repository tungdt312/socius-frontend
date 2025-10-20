import {NextResponse} from "next/server";

const EXTERNAL_BASE = process.env.API_BASE_URL!;
const PATH = "/auth/register";

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
        return NextResponse.json({ error: data?.message ?? "Đăng ký thất bại" }, { status: res.status });
    }

    return NextResponse.json({ok: true});
}