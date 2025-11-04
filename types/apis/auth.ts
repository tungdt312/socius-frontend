//Auth
import {OtpType} from "@/constants/enum";

export interface ErrorResponse {
    message: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    email: string;
    status: string;
    token: TokenResponse
}
export interface RegisterRequest {
    fullname: string;
    username: string;
    password: string;
    email: string;
    dateOfBirth: string;
}
export interface RegisterResponse {
    message: string;
}
export interface SendVerifyEmailRequest {
    email: string;
}
export interface SendVerifyEmailResponse {
    message: string;
    code: string;
}
export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
}
export interface OtpVerificationRequest {
    email: string;
    code: string;
    type: OtpType
}
