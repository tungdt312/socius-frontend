"use client";

import { useState } from "react";
import {
    MoreHorizontal,
    Eye,
    CheckCircle,
    XCircle,
    ExternalLink,
    Filter,
    ChevronsUpDown, Check
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
import {ReportStatus, ReportableType, ReportResponse} from "@/types/dtos/report";
import {processReport} from "@/services/reportService";
import { toast } from "sonner";// Component bạn đã tạo
import Link from "next/link";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "cmdk";
import {cn} from "@/lib/utils";

interface Props {
    report: ReportResponse;
    onSuccess: () => void;
}

export const ReportActionMenu = ({ report, onSuccess }: Props) => {
    // Helper tạo link đến nội dung
    const getTargetLink = () => {
        switch (report.targetType) {
            case ReportableType.USER: return `/moderator/user/${report.targetId}`;
            case ReportableType.POST: return `/moderator/post/${report.targetId}`;
            case ReportableType.COMMENT: return `/moderator/comment/${report.targetId}`;
            case ReportableType.MESSAGE: return `/moderator/message/${report.targetId}`;
            // Thêm các case khác nếu cần
            default: return "#";
        }
    };

    // Hàm gọi API xử lý
    const handleReview = async (status: ReportStatus) => {
        await processReport(report.id, {
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
                <Link href={`/moderator/reports/${report.id}`} target="_blank" passHref>
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

interface ReportStatusFilterProps {
    value?: ReportStatus | null; // Giá trị hiện tại (null = tất cả)
    onChange: (status: ReportStatus | null) => void; // Hàm callback khi chọn
}

// Map hiển thị label tiếng Việt cho đẹp
const statusOptions = [
    { value: ReportStatus.PENDING, label: "Chờ xử lý" },
    { value: ReportStatus.APPROVED, label: "Vi phạm" },
    { value: ReportStatus.REJECTED, label: "Đã từ chối" },
];

export function ReportStatusFilter({ value, onChange }: ReportStatusFilterProps) {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {/* Icon Filter cho trực quan */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 opacity-50" />
                        {value
                            ? statusOptions.find((framework) => framework.value === value)?.label
                            : "Tất cả trạng thái"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] p-0">
                <Command>
                    {/* Nếu list ít thì không cần Input search, có thể bỏ dòng dưới */}
                    {/*<CommandInput placeholder="Tìm trạng thái..." />*/}
                    <CommandList>
                        <CommandEmpty>Không tìm thấy.</CommandEmpty>
                        <CommandGroup>
                            {/* Option: Tất cả */}
                            <CommandItem
                                value="all"
                                onSelect={() => {
                                    onChange(null); // Null đại diện cho không lọc (Tất cả)
                                    setOpen(false);
                                }}
                                className={"flex items-center gap-2 px-2 py-1 hover:bg-muted cursor-pointer rounded-lg"}
                            >

                                Tất cả
                                <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    !value ? "opacity-100" : "opacity-0"
                                )}
                            />
                            </CommandItem>

                            {/* Các status từ Enum */}
                            {statusOptions.map((status) => (
                                <CommandItem
                                    key={status.value}
                                    value={status.label} // Command search theo label
                                    onSelect={() => {
                                        // Nếu bấm vào cái đang chọn thì bỏ chọn (thành null), ngược lại set value
                                        onChange(status.value === value ? null : status.value);
                                        setOpen(false);
                                    }}
                                    className={"flex items-center gap-2 px-2 py-1 hover:bg-muted cursor-pointer rounded-lg"}
                                >

                                    {status.label}
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === status.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}