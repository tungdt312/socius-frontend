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

export interface ReportRequest {
    targetType: ReportableType,
    targetId: string,
    reason: ReportReason,
    customReason?: string,
}

export interface ReportResponse{
    id: string,
    targetType: ReportableType,
    targetId: string,

    reporterId: string,
    reporterName: string,
    reporterAvatar: string,

    reason: ReportReason,
    customReason?: string,
    createdAt: string,
    status: ReportStatus,
}

export enum ComplaintStatus {
    PENDING = "PENDING",
    APPROVED_RESTORE = "APPROVED_RESTORE",
    REJECTED_KEEP = "REJECTED_KEEP",
}
export interface ComplaintRequest {
    targetId: string,
    targetType: ReportableType,
    reason: string,
}

export interface ComplaintResponse {
    id: string,
    reportId: string,
    userId: string,
    userDisplayName: string,
    content: string,
    adminResponse: string,
    status: ComplaintStatus,
    createdAt: string,
    updatedAt: string,
}