"use client"
import React, {useState} from 'react'
import {useCurrentUser} from "@/components/user/CommentForm";
import {usePathname} from "next/navigation";

const MessageSideNav = () => {
    const pathName = usePathname()
    const [search, setSearch] = useState("")
    const owner= useCurrentUser()
    const [conservations, setConservations] = useState([])
    return (
        <div className={`${pathName == "/message" ? "w-full": "hidden"} lg:w-[400px] lg:flex flex col gap-2 border-r-1 border-border`}>
            <div className={"flex justify-between w-full"}>
            {/*TODO: You va nut tao cuoc tro chuyen*/}
                navv
            </div>
            {/*search*/}
            <div className={""}>
            {/*    list*/}
            </div>
        </div>
    )
}
export default MessageSideNav
