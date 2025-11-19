import React from "react";
import {MessageSideNav} from "@/components/navs/MessageSideNav";


const Layout = ({children}: { children: React.ReactNode }) => {

    return (
        <div className={"flex justify-start w-full h-screen bg-background"}>
            <MessageSideNav/>
            {children}
        </div>
    )
}
export default Layout
