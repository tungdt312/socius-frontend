export async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
        ...options,
        credentials: "include", // để gửi cookie cùng request
    })

    if (res.status === 401) {
        const refresh = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
        if (refresh.ok) {
            return fetcher<T>(url, options);
        } else {
            window.location.href="/sign-in"
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

const EXTERNAL_BASE = process.env.API_BASE_URL!;
export async function callExternalApi<T>(
    path: string,
    init?: RequestInit,
): Promise<{ data: T | null; status: number; ok: boolean }> {
    const res = await fetch(`${EXTERNAL_BASE}${path}`, init);
    let data: T | null = null;
    try {
        data = await res.json();
    } catch {}
    return { data, status: res.status, ok: res.ok };
}