"use client"

import React from 'react'
import Link from "next/link";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {userNavItems} from "@/constants";
import {usePathname, useRouter} from "next/navigation";
import {UserRoleButton} from "@/components/navs/userRoleButton";
import {useRole} from "@/components/RoleContext";
import AdminSideNav from "@/components/navs/AdminSideNav";
import ModeratorSideNav from "@/components/navs/ModeratorSideNav";
import UserSideNav from "@/components/navs/UserSideNav";
import {AdminFootNav} from "@/components/navs/AdminFootNav";
import {ModeratorFootNav} from "@/components/navs/ModeratorFootNav";
import {UserFootNav} from "@/components/navs/UserFootNav";

const FootNav = () => {
    const {activeRole} = useRole();
    // Switch-case để chọn Navbar
    switch (activeRole) {
        case "ADMIN":
            return <AdminFootNav/>;
        case "MODERATOR":
            return <ModeratorFootNav/>;
        case "USER":
        default:
            return <UserFootNav/>;
    }
}
export default FootNav