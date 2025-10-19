// lib/cookie.ts
import { NextResponse } from "next/server";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    // domain: process.env.COOKIE_DOMAIN ?? undefined,
};

export function setAuthCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken?: string,
    access_expires_in_seconds?: number
) {
    // access token cookie (short lived)
    response.cookies.set("accessToken", accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 15, // default 15m
    });

    if (refreshToken) {
        // refresh token cookie (longer lived)
        response.cookies.set("refreshToken", refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 60 * 60 * 24 * 30, // 30 days by default
        });
    }
}

export function clearAuthCookies(response: NextResponse) {
    response.cookies.set("accessToken", "", { ...COOKIE_OPTIONS, maxAge: 0 });
    response.cookies.set("refreshToken", "", { ...COOKIE_OPTIONS, maxAge: 0 });
}
