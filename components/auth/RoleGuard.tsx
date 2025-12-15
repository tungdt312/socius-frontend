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
    // Thêm pathname để debug hoặc re-run effect khi đổi trang (tùy chọn)
    //const pathname = usePathname();

    useEffect(() => {
        // Chỉ chạy logic khi đã load xong dữ liệu
        if (!isLoading) {

            // 1. Nếu Role hiện tại (activeRole) đã hợp lệ -> KHÔNG LÀM GÌ CẢ
            // (Giữ nguyên trải nghiệm người dùng, không switch qua lại)
            if (allowedRoles.includes(activeRole)) {
                return;
            }

            // 2. Nếu Role hiện tại KHÔNG hợp lệ -> Tìm một role khác trong availableRoles mà hợp lệ
            const validRole = availableRoles.find(r => allowedRoles.includes(r));

            if (validRole) {
                // Tìm thấy role hợp lệ -> Switch sang role đó (chỉ đổi state, không redirect URL vì switchRole của bạn đã bỏ router.push)
                console.log(`Auto switching from ${activeRole} to ${validRole} for access.`);
                switchRole(validRole);
            } else {
                // 3. Không tìm thấy bất kỳ role nào hợp lệ
                console.warn(`Access Denied: User roles [${availableRoles}] do not match allowed [${allowedRoles}]`);
                toast.error("Bạn không có quyền truy cập trang này");
                router.push("/sign-in");
            }
        }
    }, [isLoading, activeRole, availableRoles, allowedRoles, router, switchRole]);

    // 1. Loading UI
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Image src={"/Logo.svg"} alt={"logo"} height={150} width={150} />
            </div>
        );
    }

    // 2. Chặn render tạm thời nếu role chưa khớp (để tránh nháy nội dung trước khi switchRole hoặc redirect kịp chạy)
    if (!allowedRoles.includes(activeRole)) {
        return null;
    }

    // 3. Render nội dung
    return <>{children}</>;
};

export default RoleGuard;