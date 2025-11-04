import React from 'react'
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {UserList} from "@/components/user/UserList";

const Page = () => {
    return (
        <div
            className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] h-full p-4 text-foreground"}>
            <Tabs defaultValue="post">
                <TabsList className={"w-full"}>
                    <TabsTrigger value="post">Bài viết</TabsTrigger>
                    <TabsTrigger value="user">Người dùng</TabsTrigger>
                </TabsList>
                <TabsContent className={"gap-2"} value="post">
                    <p className={"heading5 mb-4"}>Bài viết</p>
                </TabsContent>
                <TabsContent className={"gap-2"} value="user">
                    <p className={"heading5 mb-4"}>Người dùng</p>
                    <UserList type={"search"}/>
                </TabsContent>
            </Tabs>
        </div>
    )
}
export default Page
