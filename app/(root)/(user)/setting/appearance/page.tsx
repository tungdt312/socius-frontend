import React from 'react'
import {ThemeForm} from "@/components/ThemeToggle";

const Page = () => {
    return (
        <div className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] min-h-full h-fit p-4 text-foreground"}>
            <p className={"heading5 mb-4"}>Tùy chọn giao diện</p>
            <ThemeForm/>
        </div>
    )
}
export default Page
