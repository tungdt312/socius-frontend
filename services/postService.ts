import {EditPostRequest, PostRequest, PostResponse} from "@/types/dtos/post";
import {Base, BaseResponse, Page} from "@/types/dtos/base";
import {apiFetch, processResponse} from "@/services/baseService";

export async function getPostsByUserId(userId: string): Promise<Page<PostResponse>> {
    const res = await apiFetch(`/posts/user/${userId}`, true, {
        method: "GET",
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getNewFeed(): Promise<Page<PostResponse>> {
    const res = await apiFetch(`/posts/feed`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getPostById(postId: string): Promise<PostResponse> {
    const res = await apiFetch(`/posts/${postId}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    })
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
    if (post.media && post.media.length > 0) post.media.forEach(media => {
        formData.append('media', media)
    })
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

export async function editPost(post: EditPostRequest): Promise<PostResponse> {
    const formData = new FormData()
    if (post.postId) formData.append('postId', post.postId)
    if (post.content) formData.append('content', post.content)
    if (post.accessModifier) formData.append('accessModifier', post.accessModifier.toString())
    if (post.media && post.media.length > 0) post.media.forEach(media => {
        formData.append('media', media)
    })
    if (post.keepMediaUrls && post.keepMediaUrls.length > 0 ) post.keepMediaUrls.forEach(url => {
        formData.append('keepMediaUrls', url.toString())
    })
    if (post.removeMediaUrls && post.removeMediaUrls.length > 0) post.removeMediaUrls.forEach(url => {
        formData.append('removeMediaUrls', url.toString())
    })
    const res = await apiFetch(`/posts/update`, true, {
        method: "PUT",
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