"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {RoleType, useRole} from "../RoleContext";
import { toast } from "sonner";
import Image from "next/image";


interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: RoleType[]; // Danh sách các role được phép truy cập
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { activeRole, isLoading, switchRole, availableRoles } = useRole();
    const router = useRouter();

    useEffect(() => {
        // Chỉ kiểm tra khi đã load xong dữ liệu (isLoading = false)
        if (!isLoading) {
            availableRoles.forEach(r =>{
                console.log(r)
                if (allowedRoles.includes(r)) {
                    switchRole(r);
                    return;
                }
            })
            // Nếu role hiện tại KHÔNG nằm trong danh sách cho phép
            if (!availableRoles.includes(allowedRoles[0])) {
                console.warn(`Access Denied: Role '${activeRole}' is not authorized.`);
                toast.error("Bạn không có quyền truy cập trang này")
                // Logic Redirect tùy chỉnh:
                // Cách 1: Đẩy về trang đăng nhập
                router.push("/sign-in");
            }
        }
    }, [isLoading,  allowedRoles, router]);

    // 1. Trạng thái đang tải: Có thể render Spinner hoặc Skeleton
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Image src={"/Logo.svg"} alt={"logo"} height={150} width={150} />
            </div>
        );
    }

    // 2. Trạng thái không có quyền (Trong lúc chờ useEffect redirect, return null để không flash nội dung)
    if (!allowedRoles.includes(activeRole)) {
        return null;
    }

    // 3. Trạng thái hợp lệ: Render nội dung
    return <>{children}</>;
};

export default RoleGuard;