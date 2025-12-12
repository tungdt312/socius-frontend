"use client"
import React, {useEffect} from 'react'
import {RoleProvider, useRole} from "@/components/RoleContext";
import {useCurrentUser} from "@/components/userContext";
import ModeratorSideNav from "@/components/navs/ModeratorSideNav";
import Header from "@/components/navs/Header";
import Header2 from "@/components/navs/Header2";
import {StompProvider} from "@/components/StompContext";
import {ModeratorFootNav} from "@/components/navs/ModeratorFootNav";
import RoleGuard from "@/components/auth/RoleGuard";
import UserSideNav from "@/components/navs/UserSideNav";
import {UserFootNav} from "@/components/navs/UserFootNav";

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <RoleGuard allowedRoles={["USER"]}>
        <div className={"flex flex-col md:flex-row justify-start w-full h-screen bg-background"}>
                <UserSideNav/>
                <div className={"flex flex-col w-full h-screen bg-background"}>
                    <Header/>
                    <Header2/>
                    <StompProvider>
                        <div className={"flex flex-col flex-1 bg-background text-foreground overflow-auto relative"}>
                            {children}
                        </div>
                    </StompProvider>
                    <UserFootNav/>
                </div>

        </div>
    </RoleGuard>
    )
}
export default Layout
