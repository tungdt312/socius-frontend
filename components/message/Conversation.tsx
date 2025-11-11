"use client"
import React from 'react'
import {usePathname} from "next/navigation";

const Conversation = () => {
    const pathName = usePathname()
    return (
        <div className={`${pathName == "/message" ? "hidden": "flex"}`}>Conversation</div>
    )
}
export default Conversation
