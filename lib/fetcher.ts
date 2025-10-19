import {redirect} from "next/navigation";

const EXTERNAL_BASE = process.env.API_BASE_URL!;
export async function fetcher(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
        ...options,
        credentials: "include", // để gửi cookie cùng request
    })

    if (res.status === 401) {
        const refresh = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
        if (refresh.ok) {
            // refresh xong gọi lại request ban đầu
            return fetcher(url, options);
        } else {
            redirect("/sign-in")
            throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
    }
    if (!res.ok) {
        let message = `API Error: ${res.status}`;
        try {
            const err = await res.json();
            if (err?.error) message = err.error;
            else if (err?.message) message = err.message;
        } catch (_) {

        }
        throw new Error(message);
    }

    return res.json()
}
