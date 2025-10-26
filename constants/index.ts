import {Bell, Compass, House, MessageCircle, PlusSquare, Search, Settings, User, UserCog, UserLock} from "lucide-react";
import {ForwardedRef} from "react";

export const userNavItems = [
    {
        name: "Trang chủ",
        url: "/",
        icon: House
    },{
        name: "Tìm kiếm",
        url: "/",
        icon: Search
    },{
        name: "Tin nhắn",
        url: "/message",
        icon: MessageCircle
    },{
        name: "Thông báo",
        url: "/",
        icon: Bell
    },{
        name: "Tạo",
        url: "/",
        icon: PlusSquare
    },{
        name: "Cài đặt",
        url: "/setting",
        icon: Settings
    },
]
export const moderatorNavItems = [
    {
        name: "Trang chủ",
        url: "/moderator/",
        icon: House
    },
    {
        name: "Báo cáo vi phạm",
        url: "/moderator/reports",
        icon: Search
    },{
        name: "Nội dung vi phạm",
        url: "/moderator/contents",
        icon: Compass
    },{
        name: "Danh sách người dùng",
        url: "/moderator/users",
        icon: MessageCircle
    },{
        name: "Cài đặt",
        url: "/moderator/setting",
        icon: Settings
    },
]
export const adminNavItems = [
    {
        name: "Trang chủ",
        url: "/admin/",
        icon: House
    },
    {
        name: "Người dùng",
        url: "/admin/users",
        icon: Search
    },{
        name: "Cài đặt hệ thống",
        url: "moderator/setting",
        icon: Settings
    },
]
export const roleMap = new Map<string, {name: string, url: string, icon: ForwardedRef<any>}>([
    ["USER", {name: "Người dùng", url: "/", icon: User }],
    ["MODERATOR", {name: "Kiểm duyệt viên", url: "/moderator/", icon:UserLock }],
    ["ADMIN", {name: "Quản trị viên", url: "/admin/", icon: UserCog}],
])