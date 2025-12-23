import React from 'react'
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import FlaggedPostTable from "@/components/moderator/FlaggedPostTable";
import ModeratorUserTable from "@/components/moderator/ModeratorUserTable";
import FlaggedCommentTable from "@/components/moderator/FlaggedCommentTable";
import FlaggedMessageTable from "@/components/moderator/FlaggedMessageTable";

const Page = () => {
    return (
        <div className={"flex flex-col justify-start items-start gap-4 mx-auto w-full h-fit p-4 text-foreground"}>
            <div className={"flex items-center justify-start w-full h-fit bg-background px-4 py-2 ring-1 ring-border rounded-lg"}>
                <span className={"heading5"}>Báo cáo vi phạm</span>
            </div>
            <Tabs defaultValue="user" className={"w-full"}>
                <TabsList className={"w-full"}>
                    <TabsTrigger value="user">Người dùng</TabsTrigger>
                    <TabsTrigger value="post">Bài viết</TabsTrigger>
                    <TabsTrigger value="comment">Bình luận</TabsTrigger>
                    <TabsTrigger value="message">Tin nhắn</TabsTrigger>
                </TabsList>
                <TabsContent className={"gap-2"} value="post">
                    <FlaggedPostTable/>
                </TabsContent>
                <TabsContent className={"gap-2"} value="user">
                    <ModeratorUserTable/>
                </TabsContent>
                <TabsContent className={"gap-2"} value="comment">
                    <FlaggedCommentTable/>
                </TabsContent>
                <TabsContent className={"gap-2"} value="message">
                    <FlaggedMessageTable/>
                </TabsContent>
            </Tabs>
        </div>
    )
}
export default Page
