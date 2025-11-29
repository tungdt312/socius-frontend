"use client"
import React from 'react'
import UserSideNav from "@/components/navs/UserSideNav";
import {RoleProvider, useRole} from "@/components/RoleContext";
import AdminSideNav from "@/components/navs/AdminSideNav";
import ModeratorSideNav from "@/components/navs/ModeratorSideNav";


const SideNav = () => {
    const {activeRole} = useRole();
    // Switch-case để chọn Navbar
    switch (activeRole) {
        case "ADMIN":
            return <AdminSideNav/>;
        case "MODERATOR":
            return <ModeratorSideNav/>;
        case "USER":
        default:
            return <UserSideNav/>;
    }
}
export default SideNav
