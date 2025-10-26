import React from 'react'
import SideNav from "@/components/navs/SideNav";
import FootNav from "@/components/FootNav";
import Header from "@/components/Header";

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className={"flex flex-col md:flex-row justify-start w-full "}>
            <Header/>
            <SideNav/>
            {children}
            <FootNav/>
        </div>
    )
}
export default Layout
