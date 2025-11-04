import {NextResponse} from "next/server";
import {ErrorResponse, RegisterResponse, SendVerifyEmailResponse} from "@/types/apis/auth";
import {callExternalApi} from "@/lib/fetcher";

const EXTERNAL_BASE = process.env.API_BASE_URL!;
const PATH = "/auth/sendVerifyEmail";

export async function POST(req: Request) {
    try {
        const res = await callExternalApi(
            PATH,
            false,
            req
        );
        if (!res.ok) {

            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, {status: res.status});
        }
        const data: SendVerifyEmailResponse = await res.json();
        return Response.json(data, {status: res.status});
    } catch (error) {
        console.error("Lỗi sendOtp:", error);
        return Response.json(
            {message: "Lỗi server hoặc kết nối API thất bại"},
            {status: 500}
        );
    }
}