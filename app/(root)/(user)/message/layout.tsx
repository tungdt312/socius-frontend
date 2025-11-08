import React from "react";
import SettingDropNav from "@/components/navs/SettingDropNav";
import SettingSideNav from "@/components/navs/SettingSideNav";
import {ScrollArea} from "@/components/ui/scroll-area";
import MessageSideNav from "@/components/navs/MessageSideNav";


const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className={"flex flex-col lg:flex-row justify-start w-full h-screen bg-background"}>
            <MessageSideNav/>
            <div className="h-screen w-full">
                {children}
            </div>
        </div>
    )
}
export default Layout
