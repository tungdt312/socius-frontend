// lib/api/apiClient.ts

import {ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY} from "@/constants";
import {ErrorResponse} from "@/types/dtos/base";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Biến này ngăn việc gọi refresh lặp lại vô hạn


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
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void, reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
};

/**
 * (3) THAY THẾ HÀM APIFETCH CŨ CỦA BẠN BẰNG HÀM NÀY
 * (Phiên bản đã sửa lỗi race condition)
 */
export async function apiFetch(url: string, needAuth: boolean, options: RequestInit = {}): Promise<Response> {

    // Lấy token và gán header (nếu cần)
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token !== null && needAuth) {
        if (!options.headers) {
            options.headers = {};
        }
        (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    let res: Response;
    try {
        res = await fetch(`${BASE_URL}${url}`, options);
    } catch (error) {
        // Xử lý lỗi network
        throw new Error((error as Error).message ?? "Lỗi network hoặc API không phản hồi");
    }

    // Xử lý lỗi 401 (Hết hạn token)
    if ((res.status === 401 || res.status === 403) && needAuth) {

        if (isRefreshing) {
            // --- TRƯỜNG HỢP (CALL B, CALL C): ĐANG REFRESH ---
            // "Tạm dừng" request này bằng cách đưa nó vào hàng đợi
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (newAccessToken: string) => {
                        // Khi được "đánh thức", lặp lại request với token mới
                        (options.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
                        resolve(fetch(`${BASE_URL}${url}`, options)); // Resolve bằng fetch mới
                    },
                    reject: (error) => {
                        reject(error);
                    }
                });
            });

        } else {
            // --- TRƯỜNG HỢP (CALL A): LÀ NGƯỜI ĐẦU TIÊN ---
            isRefreshing = true;

            try {
                const newAccessToken = await refreshAccessToken();

                if (newAccessToken) {
                    // Refresh thành công
                    isRefreshing = false;
                    processQueue(null, newAccessToken); // "Đánh thức" hàng đợi

                    // Lặp lại request (Call A) với token mới
                    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
                    res = await fetch(`${BASE_URL}${url}`, options);
                    return res;
                } else {
                    // Refresh thất bại (nhưng không lỗi)
                    throw new Error("Refresh token thất bại, vui lòng đăng nhập lại.");
                }

            } catch (error) {
                // Refresh thất bại (có lỗi exception)
                isRefreshing = false;
                processQueue(error, null); // "Đánh thức" hàng đợi (bằng lỗi)

                // Đăng xuất người dùng
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                window.location.href = '/sign-in';

                // Trả về response 401 gốc hoặc ném lỗi
                return res;
            }
        }
    }
    // Nếu không phải 401, trả về response bình thường
    return res;
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