import React from 'react'
import SettingSideNav from "@/components/navs/SettingSideNav";
import SettingDropNav from "@/components/navs/SettingDropNav";
import {ScrollArea} from "@/components/ui/scroll-area";

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className={"flex flex-col lg:flex-row justify-start w-full h-screen bg-background"}>
            <SettingDropNav />
            <SettingSideNav/>
            <ScrollArea className="h-screen w-full">
                {children}
            </ScrollArea>

        </div>
    )
}
export default Layout
