import React from 'react'
import UserDetail from "@/components/user/UserDetail";
import {Separator} from "@/components/ui/separator";
import MyPostList from "@/components/user/MyPostList";
import PostDetail from "@/components/user/PostDetail";


const Page = async ({params, searchParams}: {
    params: Promise<{ id: string }>,
    searchParams: { [key: string]: string | undefined }
}) => {
    const {i = "0"} = await searchParams;
    const {id} = await params;
    return (
        <div className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] flex-1 overflow-hidden p-4 text-foreground"}>
            <PostDetail postId={id} i={i}/>
        </div>
    )
}
export default Page
