import React from 'react'
import SideNav from "@/components/navs/SideNav";
import FootNav from "@/components/FootNav";
import Header from "@/components/Header";
import Header2 from "@/components/Header2";

const Layout = ({children}: { children: React.ReactNode }) => {
    const user = {}
    return (
        <div className={"flex flex-col md:flex-row justify-start w-full bg-accent"}>
            <SideNav user={user} />
            <div className={"flex flex-col w-full h-screen scroll-auto bg-accent"}>
                <Header user={user}/>
                <Header2 user={user}/>
                {children}
                <FootNav user={user}/>
            </div>
        </div>
    )
}
export default Layout
