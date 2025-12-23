import React from 'react'
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import FlaggedPostTable from "@/components/moderator/FlaggedPostTable";
import FlaggedCommentTable from "@/components/moderator/FlaggedCommentTable";
import ModeratorUserTable from "@/components/moderator/ModeratorUserTable";
import FlaggedMessageTable from "@/components/moderator/FlaggedMessageTable";

const Page = () => {
    return (
        <div className={"flex flex-col justify-start items-start gap-4 mx-auto w-full h-fit p-4 text-foreground"}>
            <div className={"flex items-center justify-start w-full h-fit bg-background px-4 py-2 ring-1 ring-border rounded-lg"}>
                <span className={"heading5"}>Người dùng vi phạm</span>
            </div>
            <ModeratorUserTable/>
        </div>
    )
}
export default Page
