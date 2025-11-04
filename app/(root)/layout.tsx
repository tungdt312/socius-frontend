import React from 'react'
import SideNav from "@/components/navs/SideNav";
import FootNav from "@/components/navs/FootNav";
import Header from "@/components/navs/Header";
import Header2 from "@/components/navs/Header2";
import {toast} from "sonner";
import {UserResponse} from "@/types/apis/user";
import Error from "@/app/(root)/error";
import ErrorHandle from "@/app/(root)/error";
import {parseStringify} from "@/lib/utils";
import {globalState, setOwner} from "@/lib/token";
import {ErrorResponse} from "@/types/apis/auth";
import {notFound, redirect} from "next/navigation";
import {ScrollArea} from "@/components/ui/scroll-area";
const BASE = process.env.NEXT_PUBLIC_BASE_URL
const Layout = async ({children}: { children: React.ReactNode }) => {
    console.log(globalState.accessToken)
    const res = await fetch(`${BASE}/api/users/me`, {
        method: "GET",
    });
    if (!res.ok) {
        if (res.status === 403) {
            redirect("/sign-in")
        }
        notFound()
    }
    const data = await res.json();
    const user: UserResponse = parseStringify(data);
    setOwner(user);
    return (
        <div className={"flex flex-col md:flex-row justify-start w-full bg-background"}>
            <SideNav user={user} />
            <ScrollArea className={"flex flex-col w-full h-screen bg-background"}>
                <Header/>
                <Header2 user={user}/>
                    {children}
                <FootNav user={user}/>
            </ScrollArea>
        </div>
    )
}
export default Layout
