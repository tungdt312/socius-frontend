import React from "react";
import SettingDropNav from "@/components/navs/SettingDropNav";
import SettingSideNav from "@/components/navs/SettingSideNav";
import {ScrollArea} from "@/components/ui/scroll-area";
import MessageSideNav from "@/components/navs/MessageSideNav";
import Conversation from "@/components/message/Conversation";


const Layout = ({children}: { children: React.ReactNode }) => {

    return (
        <div className={"flex justify-start w-full h-screen bg-background"}>
            <MessageSideNav/>
            {children}
        </div>
    )
}
export default Layout
