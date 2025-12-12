import { ReportReason, ReportStatus, ReportableType } from "@/types/dtos/report";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
    [ReportReason.SPAM]: 'Spam / Tin rác',
    [ReportReason.HATE_SPEECH]: 'Ngôn từ thù địch',
    [ReportReason.HARASSMENT]: 'Quấy rối',
    [ReportReason.NUDITY]: 'Hình ảnh nhạy cảm',
    [ReportReason.VIOLENCE]: 'Bạo lực',
    [ReportReason.TERRORISM]: 'Khủng bố',
    [ReportReason.COPYRIGHT_VIOLATION]: 'Vi phạm bản quyền',
    [ReportReason.OTHER]: 'Khác',
};

export const REPORT_STATUS_CONFIG: Record<ReportStatus, { label: string; variant: string; className?: string }> = {
    [ReportStatus.PENDING]: { label: "Chờ xử lý", variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    [ReportStatus.APPROVED]: { label: "Đã duyệt (Vi phạm)", variant: "destructive", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    [ReportStatus.REJECTED]: { label: "Đã từ chối (An toàn)", variant: "outline", className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" },
};

export const TARGET_TYPE_LABELS: Record<ReportableType, string> = {
    [ReportableType.USER]: 'Người dùng',
    [ReportableType.POST]: 'Bài viết',
    [ReportableType.COMMENT]: 'Bình luận',
    [ReportableType.MESSAGE]: 'Tin nhắn',
};