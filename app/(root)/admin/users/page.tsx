import React from 'react'
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import UserTable from "@/components/admin/UserTable";

const Page = () => {
    return (
        <div className={"flex flex-col gap-4 mx-auto w-full h-fit p-4 text-foreground"}>
            <div className={"flex items-center justify-between w-full h-fit bg-background px-4 py-2 ring-1 ring-border rounded-lg"}>
                <span className={"heading5"}>Người dùng</span>
                <Button size={"sm"}> <Plus/> Thêm</Button>
            </div>
            <UserTable/>
        </div>
    )
}
export default Page
