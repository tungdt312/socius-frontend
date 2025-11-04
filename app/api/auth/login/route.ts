// app/api/auth/login/route.ts
import {setToken} from "@/lib/token";
import {ErrorResponse, LoginResponse} from "@/types/apis/auth";
import {callExternalApi} from "@/lib/fetcher";

const PATH = "/auth/login";

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
        const data: LoginResponse = await res.json();
        console.log("login", data);
        if (data && data.token) {
            setToken(data.token.accessToken, data.token.refreshToken);
        }
        return Response.json(data, {status: res.status});
    } catch (error) {
        console.error("Lỗi login:", error);
        return Response.json(
            {message: "Lỗi server hoặc kết nối API thất bại"},
            {status: 500}
        );
    }
}
