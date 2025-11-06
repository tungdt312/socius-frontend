import React from 'react'
import {Separator} from "@/components/ui/separator";
import UserDetail from "@/components/user/UserDetail";
import MyPostList from "@/components/user/MyPostList";

interface PageProps {
    params: { id: string };
}

const Page = async ({params}: PageProps) => {
    const userId = (await params).id;
   return (
        <div
            className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] h-fit p-4 text-foreground"}>
            <UserDetail userId={userId}/>
            <Separator/>
            <MyPostList userId={userId}/>
        </div>
    )
}
export default Page
