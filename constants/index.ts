import {
    Bell, Cog,
    Compass, FileCog, Flag,
    House, Info, LayoutDashboard, LucideProps,
    MessageCircle, MessageSquare, MessageSquareWarning, Palette,
    PlusSquare, ScrollText,
    Search,
    Settings,
    User,
    UserCog,
    UserLock, UserRoundCheck, UserRoundPen, UserRoundX,
    UsersRound
} from "lucide-react";
import React, {ForwardedRef} from "react";
import {CategoriesConfig, CategoryConfig} from "emoji-picker-react/src/config/categoryConfig";
import {Categories} from "emoji-picker-react";
import {NavItem} from "@/types/utils";

export const ACCESS_TOKEN_KEY = "access-token";
export const REFRESH_TOKEN_KEY = "refresh-token";
export const USER_KEY = "user";
export const USER_ROLE_KEY = "role";
export const ACTIVE_ROLE_KEY = "active_role";

export const userNavItems: NavItem[] = [
    {
        name: "Trang chủ",
        url: "/",
        icon: House
    }, {
        name: "Khám phá",
        url: "/explore",
        icon: Compass
    }, {
        name: "Bạn bè",
        url: "/friend",
        icon: UsersRound
    }, {
        name: "Tin nhắn",
        url: "/message",
        icon: MessageCircle
    }, {
        name: "Cài đặt",
        url: "/setting/profile",
        icon: Settings
    },
]
export const moderatorNavItems: NavItem[] = [
    {
        name: "Trang chủ",
        url: "/moderator",
        icon: LayoutDashboard
    },
    {
        name: "Người dùng vi phạm",
        url: "/moderator/user",
        icon: UsersRound
    },
    {
        name: "Bài viết vi phạm",
        url: "/moderator/post",
        icon: ScrollText
    },{
        name: "Bình luận vi phạm",
        url: "/moderator/comment",
        icon: MessageSquare
    },{
        name: "Tin nhắn vi phạm",
        url: "/moderator/message",
        icon: MessageCircle
    },
    {
        name: "Cài đặt",
        url: "/moderator/setting",
        icon: Cog
    },
]
export const adminNavItems: NavItem[] = [
    {
        name: "Trang chủ",
        url: "/admin",
        icon: LayoutDashboard
    },
    {
        name: "Người dùng",
        url: "/admin/users",
        icon: UsersRound
    },
]
export const userSettingNavItems: NavItem[] = [
    {
        name: "Sửa trang cá nhân",
        url: "/setting/profile",
        icon: UserRoundPen
    }, {
        name: "Tùy chọn giao diện",
        url: "/setting/appearance",
        icon: Palette
    }, {
        name: "Trạng thái tài khoản",
        url: "/setting/status",
        icon: UserRoundCheck
    }, {
        name: "Người dùng đã chặn",
        url: "/setting/blocked",
        icon: UserRoundX
    }, {
        name: "Báo cáo và hỗ trợ",
        url: "/setting/helping",
        icon: Info
    },
]

export const roleMap = new Map<string, {
    name: string,
    url: string,
    navItems: NavItem[],
    icon:  React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
}>(
    [
        ["USER", {name: "Đến trang cá nhân", url: "/", navItems: userNavItems,  icon: User}],
        ["MODERATOR", {name: "Đến trang kiểm duyệt", url: "/moderator", navItems: moderatorNavItems, icon: UserLock}],
        ["ADMIN", {name: "Đến trang trị viên", url: "/admin", navItems: adminNavItems, icon: UserCog}],
    ]
)

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