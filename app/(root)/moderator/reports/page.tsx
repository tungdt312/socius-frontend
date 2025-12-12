import React from 'react'
import UserTable from "@/components/admin/UserTable";
import ReportTable from "@/components/moderator/ReportTable";

const Page = () => {
    return (
        <div className={"flex flex-col justify-start items-start gap-4 mx-auto w-full h-fit p-4 text-foreground"}>
            <div className={"flex items-center justify-start w-full h-fit bg-background px-4 py-2 ring-1 ring-border rounded-lg"}>
                <span className={"heading5"}>Báo cáo vi phạm</span>
            </div>
            <ReportTable/>
        </div>
    )
}
export default Page
