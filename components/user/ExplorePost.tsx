"use client"
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Page, PageRequest} from "@/types/dtos/base";
import {UserRelationResponse} from "@/types/dtos/user";
import {getExplore, getNewFeed, getPostById, getPostsByUserId} from "@/services/postService";
import {toast} from "sonner";
import {PostResponse} from "@/types/dtos/post";
import {PostCard, PostCardSkeleton} from "@/components/user/Post";
import Link from 'next/link';
import {LoaderCircle} from "lucide-react";

const ExplorePost = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [posts, setPosts] = useState<PostResponse[]>([]);

    const observer = useRef<IntersectionObserver | null>(null);

    // Element cuối cùng để trigger load more
    const lastUserElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return; // Đang load thì không trigger

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                // Khi thấy phần tử cuối cùng -> Tăng page lên
                setCurrentPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);
    const FetchData = async () => {
        try {
            const page: PageRequest ={
                page: currentPage,
                size: 10,
            }
            setIsLoading(true);
            const res = await getExplore(page);
            setCurrentPage(res.page)
            setHasMore(res.numberOfElements == res.size)
            setPosts(posts.concat(res.content ?? []));
        } catch (error) {
            toast.error((error as Error).message ?? "Lỗi khi load bài ")
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        FetchData()
    }, [currentPage])
    return (
        <div className={"flex flex-col items-center gap-4 w-full h-fit"}>
            {
                posts.map((p, index) => {
                    if (posts.length === index + 1) {
                        return (
                            <div ref={lastUserElementRef} key={p.id} className="w-full">
                                <PostCard post={p} />
                            </div>
                        );
                    }
                    return <PostCard post={p} key={p.id}/>;
                })}
            {
                posts.length <= 0 && !isLoading && <p className={"text-center w-full"}>Không có Bài viết nào</p>
            }
            {isLoading && (
                <div className="py-4">
                    {/* Hoặc spinner nhỏ nếu load more */}
                    {currentPage > 0 && <LoaderCircle className="animate-spin size-6 mx-auto mt-2 text-muted-foreground"/>}
                </div>
            )}
            {!hasMore && posts.length > 0 && (
                <span className="text-xs text-muted-foreground py-4">Đã hiển thị hết danh sách</span>
            )}
        </div>
    )
}
export default ExplorePost
