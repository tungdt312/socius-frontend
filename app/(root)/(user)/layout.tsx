"use client"
import React, {useEffect} from 'react'
import {useRole} from "@/components/RoleContext";
import {useCurrentUser} from "@/components/userContext";

const Layout = ({children}: { children: React.ReactNode }) => {
    const { switchRole } = useRole();
    useEffect(() => {
        switchRole("USER")
    }, []);
    return (
        <>{children}</>
    )
}
export default Layout
