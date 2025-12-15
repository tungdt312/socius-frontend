// contexts/RoleContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ACTIVE_ROLE_KEY, USER_ROLE_KEY } from "@/constants";
import { useRouter } from "next/navigation";

export type RoleType = "USER" | "ADMIN" | "MODERATOR";

interface RoleContextType {
    activeRole: RoleType;
    switchRole: (role: RoleType) => void;
    availableRoles: RoleType[];
    isLoading: boolean; // Thêm biến này để các component biết mà chờ
}

const RoleContext = createContext<RoleContextType>({
    activeRole: "USER",
    switchRole: () => {},
    availableRoles: [],
    isLoading: true,
});

export const useRole = () => useContext(RoleContext);

// 1. Sửa lại hook này
export const useCurrentRoles = () => {
    const [roles, setRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Mặc định là đang load

    useEffect(() => {
        // Chỉ chạy ở phía Client
        if (typeof window !== "undefined") {
            try {
                const data = localStorage.getItem(USER_ROLE_KEY);
                console.log("Raw LocalStorage Data:", data);

                // Kiểm tra kỹ: data phải tồn tại VÀ không được là chuỗi "undefined" hoặc "null"
                if (data && data !== "undefined" && data !== "null") {
                    const parsedRoles = JSON.parse(data);

                    // Kiểm tra thêm: kết quả parse phải là mảng
                    if (Array.isArray(parsedRoles)) {
                        setRoles(parsedRoles);
                    } else {
                        console.warn("Dữ liệu role không phải là mảng, reset về rỗng.");
                        setRoles([]);
                    }
                } else {
                    // Nếu dữ liệu là null, "undefined", hoặc rỗng -> coi như chưa có role
                    console.log("Không tìm thấy role hợp lệ, reset.");
                    setRoles([]);

                    // (Tùy chọn) Xóa dữ liệu rác nếu nó là "undefined"
                    if (data === "undefined" || data === "null") {
                        localStorage.removeItem(USER_ROLE_KEY);
                    }
                }
            } catch (e) {
                console.error("Lỗi khi đọc roles:", e);
                // Nếu lỗi parse, xóa luôn key hỏng để lần sau không lỗi nữa
                localStorage.removeItem(USER_ROLE_KEY);
                setRoles([]);
            } finally {
                // QUAN TRỌNG: Luôn tắt loading dù thành công hay thất bại
                setIsLoading(false);
            }
        }
    }, []); // <--- QUAN TRỌNG: Thêm mảng rỗng để chỉ chạy 1 lần

    return { roles, isLoading };
}

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
    const { roles, isLoading } = useCurrentRoles();
    const [activeRole, setActiveRole] = useState<RoleType>("USER");
    const router = useRouter();

    useEffect(() => {
        // Chỉ chạy logic chọn activeRole khi ĐÃ LOAD XONG roles
        if (!isLoading && roles && roles.length > 0) {
            const savedRole = localStorage.getItem(ACTIVE_ROLE_KEY) as RoleType;

            // Kiểm tra kỹ hơn: savedRole phải hợp lệ và nằm trong danh sách roles của user
            if (savedRole && roles.includes(savedRole)) {
                setActiveRole(savedRole);
            } else {
                // Ưu tiên USER, nếu không thì lấy cái đầu tiên
                setActiveRole((roles.includes("USER") ? "USER" : roles[0]) as RoleType);
            }
        }
    }, [roles, isLoading]);

    const switchRole = (role: RoleType) => {
        // Nếu đang load thì không cho switch (hoặc bỏ qua check)
        if (isLoading) return;

        // Bảo mật:
        if (!roles.includes(role)) {
            console.log("Current Available Roles:", roles);
            console.log("Target Role:", role);
            console.error("Bạn không có quyền chuyển sang role này!");

            // Chỉ redirect về sign-in nếu thực sự không có quyền và không đang ở trang sign-in
            router.push("/sign-in");
            return;
        }

        console.log(`Switching to ${role}`);
        setActiveRole(role);
        localStorage.setItem(ACTIVE_ROLE_KEY, role);
    };

    return (
        <RoleContext.Provider value={{
            activeRole,
            switchRole,
            availableRoles: roles as RoleType[],
            isLoading // Truyền xuống để các Guard component sử dụng
        }}>
            {children}
        </RoleContext.Provider>
    );
};