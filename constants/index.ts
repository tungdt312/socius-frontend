import {
    Bell,
    Compass,
    House, Info,
    MessageCircle, Palette,
    PlusSquare,
    Search,
    Settings,
    User,
    UserCog,
    UserLock, UserRoundCheck, UserRoundPen, UserRoundX,
    UsersRound
} from "lucide-react";
import {ForwardedRef} from "react";
import {CategoriesConfig, CategoryConfig} from "emoji-picker-react/src/config/categoryConfig";
import {Categories} from "emoji-picker-react";

export const ACCESS_TOKEN_KEY = "access-token";
export const REFRESH_TOKEN_KEY = "refresh-token";
export const USER_KEY = "user";
export const userNavItems = [
    {
        name: "Trang chủ",
        url: "/",
        icon: House
    },{
        name: "Khám phá",
        url: "/explore",
        icon: Compass
    },{
        name: "Bạn bè",
        url: "/friend",
        icon: UsersRound
    },{
        name: "Tin nhắn",
        url: "/message",
        icon: MessageCircle
    },{
        name: "Cài đặt",
        url: "/setting/profile",
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
export const userSettingNavItems = [
    {
        name: "Sửa trang cá nhân",
        url: "/setting/profile",
        icon: UserRoundPen
    },{
        name: "Tùy chọn giao diện",
        url: "/setting/appearance",
        icon: Palette
    },{
        name: "Trạng thái tài khoản",
        url: "/setting/status",
        icon: UserRoundCheck
    },{
        name: "Người dùng đã chặn",
        url: "/setting/blocked",
        icon: UserRoundX
    },{
        name: "Báo cáo và hỗ trợ",
        url: "/setting/helping",
        icon: Info
    },
]

export const roleMap = new Map<string, {name: string, url: string, icon: ForwardedRef<any>}>([
    ["USER", {name: "Người dùng", url: "/", icon: User }],
    ["MODERATOR", {name: "Kiểm duyệt viên", url: "/moderator/", icon:UserLock }],
    ["ADMIN", {name: "Quản trị viên", url: "/admin/", icon: UserCog}],
])

export const emojiCategory: CategoryConfig[] = [
    {
        category: Categories.SUGGESTED,
        name: 'Gần đây'
    },
    {
        category: Categories.SMILEYS_PEOPLE,
        name: 'Con người'
    },
    {
        category: Categories.ANIMALS_NATURE,
        name: 'Tự nhiên'
    },
    {
        category: Categories.FOOD_DRINK,
        name: 'Thực phẩm'
    },
    {
        category: Categories.TRAVEL_PLACES,
        name: 'Du lịch'
    },
    {
        category: Categories.ACTIVITIES,
        name: 'Hoạt động'
    },
    {
        category: Categories.OBJECTS,
        name: 'Vật thể'
    },
    {
        category: Categories.SYMBOLS,
        name: 'Ký hiệu'
    },
    {
        category: Categories.FLAGS,
        name: 'Cờ'
    }
];