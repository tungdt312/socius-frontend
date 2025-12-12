export enum ReportableType {
    USER = 'USER',
    POST = 'POST',
    COMMENT = 'COMMENT',
    MESSAGE = 'MESSAGE',
}

export enum ReportReason {
    SPAM = 'SPAM',                   // Tin rác
    HATE_SPEECH = "HATE_SPEECH" ,            // Ngôn từ thù địch
    HARASSMENT = "HARASSMENT",             // Quấy rối
    NUDITY = "NUDITY",                 // Ảnh khỏa thân
    VIOLENCE ="VIOLENCE",               // Bạo lực
    TERRORISM = "TERRORISM",              // Khủng bố
    COPYRIGHT_VIOLATION = "COPYRIGHT_VIOLATION",    // Vi phạm bản quyền
    OTHER = "OTHER",
}

export enum ReportStatus {
    PENDING = "PENDING",    // Đang chờ xử lý (Mod chưa xem)
    APPROVED = "APPROVED",   // Đã duyệt (Mod xác nhận vi phạm)
    REJECTED = "REJECTED"   // Đã từ chối (Mod thấy không vi phạm)
}
export interface ReportDTO{
    id: string,
    reporterTd: string,
    reporterName: string,

    targetType: ReportableType,
    targetId: string,

    reason: ReportReason,
    customReason?: string,
    createdAt: string,

    status: ReportStatus,
    reviewerId: string,
    moderatorNotes: string,
    reviewedAt: string
}

export interface ReportRequest {
    targetType: ReportableType,
    targetId: string,
    reason: ReportReason,
    customReason?: string,
}

export interface ReportReview {
    status: ReportStatus,
    moderatorNotes?: string,
}