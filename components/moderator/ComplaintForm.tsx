"use client"
import React, { useState } from 'react'
import {ComplaintRequest, ReportableType, ReportReason, ReportRequest} from "@/types/dtos/report";
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
} from "@/components/ui/alert-dialog";
import {complaint} from "@/services/complaintService"; // Icon loading

interface Props {
    children: React.ReactNode,
    targetType: ReportableType,
    targetId: string,
}

const ComplaintForm = ({ children, targetType, targetId }: Props) => {
    const [open, setOpen] = useState(false);
    const [customReason, setCustomReason] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleReport = async () => {
        // Validate nếu chọn OTHER mà không nhập lý do
        if (!customReason.trim()) {
            toast.error("Vui lòng nhập lý do cụ thể.");
            return;
        }

        try {
            setIsLoading(true);
            const req: ComplaintRequest = {
                targetId,
                targetType,
                reason: customReason,
            }
            await complaint(req);
            toast.success("Cảm ơn bạn đã phản hồi. Chúng tôi sẽ xem xét sớm.");
            setOpen(false); // Đóng dialog khi thành công
            resetForm();    // Reset form
        } catch (error) {
            toast.error((error as Error).message ?? "Phản hồi thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }

    const resetForm = () => {
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
                    <AlertDialogTitle>Phản hồi vi phạm</AlertDialogTitle>
                    <AlertDialogDescription>
                        Nội dung của bạn đã bị khóa do vi phạm tiêu chuẩn cộng đồng của chúng tôi. Nếu đây là nhầm lẫn, vui lòng điền thông tin phản hồi.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid gap-4 py-4">
                        <div className="mt-2 animate-in fade-in zoom-in duration-200">
                            <textarea
                                placeholder="Vui lòng mô tả chi tiết vấn đề..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                </div>

                <AlertDialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button onClick={handleReport} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gửi phản hồi
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ComplaintForm