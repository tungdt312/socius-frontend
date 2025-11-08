import React from 'react'
import {ScrollArea} from "@/components/ui/scroll-area";

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className={"flex flex-col w-full flex-1 bg-background text-foreground overflow-auto relative"}>
            {children}
        </div>
    )
}
export default Layout
