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

export enum FriendshipStatus {
    PENDING = "PENDING",
    FRIEND = "FRIEND",
    BLOCKED = "BLOCKED",
    NONE = "NONE",
}

export enum FriendActionTypes {
    accept = "accept",
    reject = "reject",
    send = "send",
    unsend = "unsend",
    block = "block",
    unblock = "unblock",
    unfriend = "unfriend",
}
export type UserListType =  "followers" | "following" | "search" | "blocked" | "friends" | "sent" | "pending";
export const listMapper: Record<UserListType, { endpoint: string; label: string }> = {
    friends: {
        endpoint: "",
        label: "Bạn bè",
    },
    followers: {
        endpoint: "followers",
        label: "Người theo dõi",
    },
    following: {
        endpoint: "followings",
        label: "Đang theo dõi",
    },
    blocked: {
        endpoint: "blocked",
        label: "Đã chặn",
    },
    sent: {
        endpoint: "sent",
        label: "Lời mời đã gửi",
    },
    pending: {
        endpoint: "pending",
        label: "Lời mời kết bạn",
    },
    search: {
        endpoint: "search",
        label: "Người dùng",
    }
};