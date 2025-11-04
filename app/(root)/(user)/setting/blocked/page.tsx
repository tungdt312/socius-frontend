import React from 'react'
import {UserList} from "@/components/user/UserList";
import {globalState} from "@/lib/token";

const Page = () => {
    return (
        <div className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] min-h-full h-fit p-4 text-foreground"}>
            <p className={"heading5 mb-4"}>Người dùng đã chặn</p>
            <UserList userId={globalState.owner?.id ?? ""} type={"Blockeds"}/>
        </div>
    )
}
export default Page
