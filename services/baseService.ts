// lib/api/apiClient.ts

import {ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY} from "@/constants";

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

/**
 * Một trình bao bọc (wrapper) cho 'fetch'
 * TỰ ĐỘNG xử lý việc đính kèm token và refresh token.
 * * @param url URL của API (ví dụ: '/products/1')
 * @param options Tùy chọn của Fetch (method, body, headers...)
 * @returns {Promise<Response>} Trả về Response gốc
 */
export async function apiFetch(url: string, needAuth: boolean, options: RequestInit = {}): Promise<Response> {
    // 1. Lấy token từ localStorage
    try {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);

        // 2. Tự động đính kèm header Authorization
        if (token !== null && needAuth) {
            if (!options.headers) {
                options.headers = {};
            }
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            console.log(token);
        }

        // 3. Gọi API
        let res = await fetch(`${BASE_URL}${url}`, options);

        // 4. KIỂM TRA HẾT HẠN (401 hoặc 403 tùy backend)
        // và đảm bảo không đang refresh rồi
        if ((res.status === 401 || res.status === 403) && !isRefreshing) {
            isRefreshing = true;

            const newAccessToken = await refreshAccessToken();
            isRefreshing = false; // Mở lại cờ

            if (newAccessToken) {
                // 5. Thử lại request với token mới
                (options.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
                res = await fetch(`${BASE_URL}${url}`, options); // GỌI LẠI
            } else {
                // 6. Refresh thất bại, đăng xuất người dùng
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                // Chuyển hướng về trang đăng nhập
                window.location.href = '/sign-in';

                // Trả về lỗi response gốc để không chạy logic tiếp theo
                return res;
            }
        }

        return res;
    } catch (error) {
        throw new Error((error as Error).message ?? "Lỗi server hoặc API");
    }
}