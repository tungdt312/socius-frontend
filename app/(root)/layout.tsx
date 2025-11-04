import React from 'react'
import SideNav from "@/components/navs/SideNav";
import FootNav from "@/components/navs/FootNav";
import Header from "@/components/navs/Header";
import Header2 from "@/components/navs/Header2";
import {ScrollArea} from "@/components/ui/scroll-area";

const BASE = process.env.NEXT_PUBLIC_BASE_URL
const Layout = async ({children}: { children: React.ReactNode }) => {
    return (
        <div className={"flex flex-col md:flex-row justify-start w-full bg-background"}>
            <SideNav />
            <ScrollArea className={"flex flex-col w-full h-screen bg-background"}>
                <Header/>
                <Header2/>
                    {children}
                <FootNav/>
            </ScrollArea>
        </div>
    )
}
export default Layout
