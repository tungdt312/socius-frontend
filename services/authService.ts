import {
    LoginRequest,
    LoginResponse, OtpVerificationRequest,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    SendVerifyEmailRequest
} from "@/types/dtos/auth";
import {apiFetch, processResponse} from "@/services/baseService";
import {BaseResponse} from "@/types/dtos/base";

export async function login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiFetch("/auth/login",false, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(res.statusText);
    console.log("Sign in success");
    return processResponse(res);
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await apiFetch("/auth/register",false, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function resetPassword(data: ResetPasswordRequest): Promise<BaseResponse> {
    const res = await apiFetch("/auth/reset-password",false, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function sendVerifyEmail(data: SendVerifyEmailRequest): Promise<BaseResponse> {
    const res = await apiFetch("/auth/sendVerifyEmail",false, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function verifyOTP(data: OtpVerificationRequest ): Promise<BaseResponse>{
    const res = await apiFetch("/auth/verify-otp",false, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
