export enum OtpType {
    verifyEmail = "VERIFY_EMAIL",
    resetPassword="RESET_PASSWORD"
}
export enum AccountStatus {
    PENDING = "PENDING",          // mới đăng ký, chưa xác minh email
    ACTIVE = "ACTIVE",            // đã xác minh, có thể đăng nhập
    BLOCKED = "BLOCKED",          // bị khóa
    NOT_AUTHORIZED = "NOT_AUTHORIZED", // chưa được cấp quyền
    NOT_SOLVED = "NOT_SOLVED",    // lỗi kỹ thuật hoặc chưa hoàn tất xử lý
}