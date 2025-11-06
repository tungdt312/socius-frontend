import {PostRequest, PostResponse} from "@/types/dtos/post";
import {Base, BaseResponse, Page} from "@/types/dtos/base";
import {apiFetch, processResponse} from "@/services/baseService";

export async function getPostsByUserId(userId: string): Promise<Page<PostResponse>> {
    const res = await apiFetch(`/posts/user/${userId}`, true, {
        method: "GET",
    } )
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getNewFeed(): Promise<Page<PostResponse>> {
    const res = await apiFetch(`/posts/feed`, true,{
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    } )
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

//chua co
export async function getPostById(postId: string): Promise<PostResponse> {
    const res = await apiFetch(`/posts/${postId}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    } )
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function sharePost(postId: string, caption: string): Promise<PostResponse> {
    const res = await apiFetch(`/posts/share?originalPostId=${postId}&&caption=${caption}`, true, {
        method: "POST",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function createPost(post: PostRequest): Promise<PostResponse> {
    const formData = new FormData()
    if (post.sharedPostId) formData.append('sharedPostId', post.sharedPostId)
    if (post.content) formData.append('content', post.content)
    if (post.accessModifier) formData.append('accessModifier', post.accessModifier.toString())
    if (post.media) formData.append('media', post.media)
    const res = await apiFetch(`/posts/create`, true, {
        method: "POST",
        headers: {
            "accept": "application/json",
        },
        body: formData,
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function deletePosts(postId: string): Promise<BaseResponse> {
    const res = await apiFetch(`/posts/${postId}`, true, {
        method: "DELETE",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}