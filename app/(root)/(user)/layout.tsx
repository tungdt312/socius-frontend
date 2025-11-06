import React from 'react'
import {ScrollArea} from "@/components/ui/scroll-area";

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className={"flex flex-col w-full h-screen bg-background text-foreground overflow-auto relative"}>
            {children}
        </div>
    )
}
export default Layout
