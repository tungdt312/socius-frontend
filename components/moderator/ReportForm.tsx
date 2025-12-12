"use client"
import React, { useState } from 'react'
import { ReportableType, ReportReason, ReportRequest } from "@/types/dtos/report";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Giả định bạn có component Button
// Nếu bạn có component Textarea và Label của shadcn, hãy import vào.
// Ở đây tôi dùng HTML thường class tailwind để đảm bảo chạy được ngay.
import { report } from "@/services/reportService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"; // Icon loading

interface Props {
    children: React.ReactNode,
    targetType: ReportableType,
    targetId: string,
}

// Map để hiển thị tiếng Việt
const REASON_LABELS: Record<ReportReason, string> = {
    [ReportReason.SPAM]: 'Tin rác (Spam)',
    [ReportReason.HATE_SPEECH]: 'Ngôn từ thù địch',
    [ReportReason.HARASSMENT]: 'Quấy rối',
    [ReportReason.NUDITY]: 'Ảnh khỏa thân / Khiêu dâm',
    [ReportReason.VIOLENCE]: 'Bạo lực',
    [ReportReason.TERRORISM]: 'Khủng bố',
    [ReportReason.COPYRIGHT_VIOLATION]: 'Vi phạm bản quyền',
    [ReportReason.OTHER]: 'Vấn đề khác',
};

const ReportForm = ({ children, targetType, targetId }: Props) => {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<ReportReason>(ReportReason.SPAM); // Default value
    const [customReason, setCustomReason] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleReport = async () => {
        // Validate nếu chọn OTHER mà không nhập lý do
        if (reason === ReportReason.OTHER && !customReason.trim()) {
            toast.error("Vui lòng nhập lý do cụ thể.");
            return;
        }

        try {
            setIsLoading(true);
            const req: ReportRequest = {
                targetId,
                targetType,
                reason,
                customReason: reason === ReportReason.OTHER ? customReason : undefined
            }
            await report(req);
            toast.success("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm.");
            setOpen(false); // Đóng dialog khi thành công
            resetForm();    // Reset form
        } catch (error) {
            toast.error((error as Error).message ?? "Báo cáo thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }

    const resetForm = () => {
        setReason(ReportReason.SPAM);
        setCustomReason("");
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetForm();
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[500px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Báo cáo nội dung</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hãy chọn lý do bạn muốn báo cáo nội dung này. Báo cáo của bạn sẽ được giữ bí mật.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Danh sách lý do */}
                    <div className="space-y-3">
                        {Object.values(ReportReason).map((r) => (
                            <div key={r} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id={`reason-${r}`}
                                    name="report-reason"
                                    value={r}
                                    checked={reason === r}
                                    onChange={(e) => setReason(e.target.value as ReportReason)}
                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                    htmlFor={`reason-${r}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {REASON_LABELS[r]}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Ô nhập text khi chọn Other */}
                    {reason === ReportReason.OTHER && (
                        <div className="mt-2 animate-in fade-in zoom-in duration-200">
                            <textarea
                                placeholder="Vui lòng mô tả chi tiết vấn đề..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button onClick={handleReport} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gửi báo cáo
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ReportForm