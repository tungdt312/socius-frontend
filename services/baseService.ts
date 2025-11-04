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
export async function apiFetch(url: string, needAuth: boolean,  options: RequestInit = {}): Promise<Response> {
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

// Chỉ để nhắc bạn nhớ về "cỗ máy"
// ... (apiFetch, refreshAccessToken, processResponse đã sửa...)

/*export const http = {
    get: async <T>(url: string): Promise<T> => {
        const res = await apiFetch(url, { method: 'GET' });
        return processResponse(res); // <--- Tự động xử lý lỗi JSON
    },
    post: async <T>(url: string, body?: any): Promise<T> => {
        const options: RequestInit = {
            method: 'POST',
            body: (body instanceof FormData) ? body : JSON.stringify(body),
        };
        const res = await apiFetch(url, options);
        return processResponse(res); // <--- Tự động xử lý lỗi JSON
    },
    del: async <T>(url: string, body?: any): Promise<T> => {
        const options: RequestInit = {
            method: 'DELETE',
            body: JSON.stringify(body),
        };
        const res = await apiFetch(url, options);
        return processResponse(res); // <--- Tự động xử lý lỗi JSON
    }
};*/
/**
 * Hàm nội bộ xử lý kết quả trả về (Phiên bản chống lỗi)
 */
export async function processResponse<T>(res: Response): Promise<T> {

    // 1. Kiểm tra các status không có nội dung
    if (res.status === 204 || res.statusText === "No Content") {
        return undefined as T; // Trả về void (không có nội dung)
    }

    // 2. Đọc body dưới dạng text TRƯỚC
    const text = await res.text();

    // 3. Nếu text rỗng, coi như là thành công (void)
    if (!text) {
        if (!res.ok) {
            // Vẫn ném lỗi nếu status là 4xx, 5xx
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        // Nếu 200 OK nhưng body rỗng, trả về void
        return undefined as T;
    }

    // 4. Nếu text không rỗng, BÂY GIỜ mới parse
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        // Bẫy lỗi nếu backend trả về text (không phải JSON)
        console.error("Failed to parse JSON:", text);
        throw new Error("Phản hồi API không phải là JSON hợp lệ.");
    }

    // 5. Xử lý lỗi từ API
    if (!res.ok) {
        throw new Error(data.message || `API Error: ${res.status}`);
    }

    return data as T;
}