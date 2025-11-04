import React from 'react'
import {ScrollArea} from "@/components/ui/scroll-area";

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <ScrollArea className="flex flex-col items-center w-full h-screen overflow-hidden">
            <div className={"flex flex-col w-full h-fit bg-background text-foreground overflow-hidden relative"}>
                {children}
            </div>
        </ScrollArea>
    )
}
export default Layout
