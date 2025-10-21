import {NextResponse} from "next/server";
import {callExternalApi} from "@/lib/fetcher";
import {SendVerifyEmailResponse} from "@/types/api";

const EXTERNAL_BASE = process.env.API_BASE_URL!;
const PATH = "/auth/reset-password";

export async function POST(req: Request) {
    const body = await req.json();
    const { data, status, ok } = await callExternalApi(PATH, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    });
    if (!ok) return NextResponse.json({ error: "Gửi mail xác thực thất bại" }, { status });
    return NextResponse.json({ ok: true });
}