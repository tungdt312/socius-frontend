"use client"
import React, {useEffect, useState} from 'react'
import {Page} from "@/types/dtos/base";
import {UserRelationResponse} from "@/types/dtos/user";
import {getNewFeed, getPostById, getPostsByUserId} from "@/services/postService";
import {toast} from "sonner";
import {PostResponse} from "@/types/dtos/post";
import {PostCard, PostCardSkeleton} from "@/components/user/Post";
import Link from 'next/link';

const NewFeed = () => {
    const [page, setPage] = useState<Page<PostResponse>>();
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const FetchData = async () => {
            try {
                setIsLoading(true);
                const res = await getNewFeed();

                setIsLoading(false);

                setPage(res)
                setPosts(posts.concat(res.content ?? []));
            } catch (error) {
                toast.error((error as Error).message ?? "Lỗi khi load bài ")
            }
        }
       FetchData()
    }, [])
    return (
        <div className={"flex flex-col items-center gap-4 w-full h-fit"}>
            { posts.length > 0 &&
                posts.map((p) => (
                        <PostCard post={p} key={p?.id ?? ""}/>
                )
            )}
            {posts.length <= 0 && <p className={"text-center w-full"}>Không có Bài viết nào</p>}
            {isLoading &&(<PostCardSkeleton/>)}
        </div>
    )
}
export default NewFeed
