import React from 'react'
import SideNav from "@/components/navs/SideNav";
import FootNav from "@/components/navs/FootNav";
import Header from "@/components/navs/Header";
import Header2 from "@/components/navs/Header2";
import {ScrollArea} from "@/components/ui/scroll-area";
import {StompProvider} from "@/components/StompContext";
import {RoleProvider} from "@/components/RoleContext";

const BASE = process.env.NEXT_PUBLIC_BASE_URL
const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className={"flex flex-col md:flex-row justify-start w-full h-screen bg-background"}>
            <RoleProvider>
                <SideNav/>
            <div className={"flex flex-col w-full h-screen bg-background"}>
                    <Header/>
                    <Header2/>
                <StompProvider>
                    <div className={"flex flex-col flex-1 bg-background text-foreground overflow-auto relative"}>
                        {children}
                    </div>
                </StompProvider>
                    <FootNav/>
            </div>
            </RoleProvider>
        </div>
    )
}
export default Layout
