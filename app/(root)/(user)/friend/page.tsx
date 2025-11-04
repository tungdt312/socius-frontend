import React from 'react'
import {UserList} from "@/components/user/UserList";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

const Page = () => {
    return (
        <div
            className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] h-full p-4 text-foreground"}>
            <Tabs defaultValue="friend">
                <TabsList className={"w-full"}>
                    <TabsTrigger value="friend">Bạn bè</TabsTrigger>
                    <TabsTrigger value="request">Lời mời kết bạn</TabsTrigger>
                    <TabsTrigger value="sent">Lời mời đã gửi</TabsTrigger>
                </TabsList>
                <TabsContent className={"gap-2"} value="friend">
                    <p className={"heading5 mb-4"}>Danh sách bạn bè</p>
                    <UserList type={"friends"} />
                </TabsContent>
                <TabsContent className={"gap-2"} value="request">
                    <p className={"heading5 mb-4"}>Lời mời kết bạn</p>
                    <UserList type={"pending"} />
                </TabsContent>
                <TabsContent className={"gap-2"} value="sent">
                    <p className={"heading5 mb-4"}>Lời mời đã gửi</p>
                    <UserList type={"sent"} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
export default Page
