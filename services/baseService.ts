// lib/api/apiClient.ts

import {ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY} from "@/constants";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Biến này ngăn việc gọi refresh lặp lại vô hạn
let isRefreshing = false;

/**
 * Hàm gọi refresh token.
 * Nó dùng fetch trực tiếp để tránh vòng lặp vô hạn.
 */
async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
        console.error("Không tìm thấy refresh token");
        return null;
    }

    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, { // Sửa URL này
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refreshToken}),
        });

        if (res.ok) {
            const tokens = await res.json(); // Giả sử trả về { accessToken, refreshToken }
            localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
            return tokens.accessToken;
        } else {
            console.error("Refresh token thất bại");
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi refresh token:", error);
        return null;
    }
}

export async function apiFetch(url: string, needAuth: boolean,  options: RequestInit = {}): Promise<Response> {

    try {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (token !== null && needAuth) {
            if (!options.headers) {
                options.headers = {};
            }
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

        }
        let res = await fetch(`${BASE_URL}${url}`, options);

        if ((res.status === 401 || res.status === 403) && !isRefreshing) {
            isRefreshing = true;

            const newAccessToken = await refreshAccessToken();
            isRefreshing = false;

            if (newAccessToken) {
                (options.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
                res = await fetch(`${BASE_URL}${url}`, options);
            } else {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                window.location.href = '/sign-in';
                return res;
            }
        }
        return res;
    } catch (error) {
        throw new Error((error as Error).message ?? "Lỗi server hoặc API");
    }
}

export async function processResponse<T>(res: Response): Promise<T> {

    if (res.status === 204 || res.statusText === "No Content") {
        return undefined as T;
    }

    const text = await res.text();

    if (!text) {
        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        return undefined as T;
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON:", text);
        throw new Error("Phản hồi API không phải là JSON hợp lệ.");
    }

    // 5. Xử lý lỗi từ API
    if (!res.ok) {
        throw new Error(data.message || `API Error: ${res.status}`);
    }

    return data as T;
}