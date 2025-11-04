import {NextResponse} from "next/server";
import {ErrorResponse, LoginResponse, RegisterResponse} from "@/types/apis/auth";
import {callExternalApi} from "@/lib/fetcher";
import {setToken} from "@/lib/token";

const PATH = "/auth/register";

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
        const data: RegisterResponse = await res.json();
        return Response.json(data, {status: res.status});
    } catch (error) {
        console.error("Lỗi register:");
        return Response.json(
            {message: "Lỗi server hoặc kết nối API thất bại"},
            {status: 500}
        );
    }
}
