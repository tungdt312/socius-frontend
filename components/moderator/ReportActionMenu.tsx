"use client";

import { useState } from "react";
import {
    MoreHorizontal,
    Eye,
    CheckCircle,
    XCircle,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDTO, ReportStatus, ReportableType } from "@/types/dtos/report";
import { reviewReport } from "@/services/reportService";
import { toast } from "sonner";// Component bạn đã tạo
import Link from "next/link";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";

interface Props {
    report: ReportDTO;
    onSuccess: () => void;
}

export const ReportActionMenu = ({ report, onSuccess }: Props) => {
    // Helper tạo link đến nội dung
    const getTargetLink = () => {
        switch (report.targetType) {
            case ReportableType.USER: return `/user/${report.targetId}`;
            case ReportableType.POST: return `/post/${report.targetId}`;
            // Thêm các case khác nếu cần
            default: return "#";
        }
    };

    // Hàm gọi API xử lý
    const handleReview = async (status: ReportStatus) => {
        await reviewReport(report.id, {
            status: status,
            moderatorNotes: status === ReportStatus.APPROVED
                ? "Đã xác nhận vi phạm qua Action Menu"
                : "Đã từ chối báo cáo qua Action Menu"
        });
        toast.success(status === ReportStatus.APPROVED ? "Đã duyệt vi phạm" : "Đã từ chối báo cáo");
        onSuccess();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>

                {/* 1. Xem nội dung (Mở tab mới) */}
                <Link href={getTargetLink()} target="_blank" passHref>
                    <DropdownMenuItem className="cursor-pointer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Xem nội dung gốc
                    </DropdownMenuItem>
                </Link>

                {/* Chỉ hiện nút duyệt nếu status là PENDING */}
                {report.status === ReportStatus.PENDING && (
                    <>
                        <DropdownMenuSeparator />

                        {/* 2. Duyệt Vi Phạm */}
                        <ConfirmDialog
                            title="Xác nhận vi phạm"
                            description="Bạn có chắc chắn nội dung này vi phạm tiêu chuẩn cộng đồng?"
                            onConfirm={() => handleReview(ReportStatus.APPROVED)}
                        >
                            {/* QUAN TRỌNG: onSelect preventDefault để giữ Dropdown không đóng ngay lập tức */}
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" /> Xác nhận vi phạm
                            </DropdownMenuItem>
                        </ConfirmDialog>

                        {/* 3. Từ chối báo cáo */}
                        <ConfirmDialog
                            title="Từ chối báo cáo"
                            description="Báo cáo này không chính xác hoặc nội dung không vi phạm?"
                            onConfirm={() => handleReview(ReportStatus.REJECTED)}
                        >
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="cursor-pointer"
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Báo cáo sai
                            </DropdownMenuItem>
                        </ConfirmDialog>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};