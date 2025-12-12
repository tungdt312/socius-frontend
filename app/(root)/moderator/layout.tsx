"use client"
import React, {useEffect} from 'react'
import {RoleProvider, useRole} from "@/components/RoleContext";
import {useCurrentUser} from "@/components/userContext";
import SideNav from "@/components/navs/SideNav";
import Header from "@/components/navs/Header";
import Header2 from "@/components/navs/Header2";
import {StompProvider} from "@/components/StompContext";
import FootNav from "@/components/navs/FootNav";
import ModeratorSideNav from "@/components/navs/ModeratorSideNav";
import {ModeratorFootNav} from "@/components/navs/ModeratorFootNav";
import RoleGuard from "@/components/auth/RoleGuard";

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <RoleGuard allowedRoles={["MODERATOR"]}>
        <div className={"flex flex-col md:flex-row justify-start w-full h-screen bg-background"}>

                <ModeratorSideNav/>
                <div className={"flex flex-col w-full h-screen bg-background"}>
                    <Header/>
                    <Header2/>
                    <StompProvider>
                        <div className={"flex flex-col flex-1 bg-background text-foreground overflow-auto relative"}>
                            {children}
                        </div>
                    </StompProvider>
                    <ModeratorFootNav/>
                </div>

        </div>
        </RoleGuard>
    )
}
export default Layout
