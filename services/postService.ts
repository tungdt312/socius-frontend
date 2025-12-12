import {EditPostRequest, PostRequest, PostResponse, SharePostRequest} from "@/types/dtos/post";
import {Base, BaseResponse, Page, PageRequest, toQueryString} from "@/types/dtos/base";
import {apiFetch, processResponse} from "@/services/baseService";

export async function getPostsByUserId(userId: string, page?: PageRequest): Page<PostResponse>{
    const res = await apiFetch(`/posts/user/${userId}?${toQueryString(page)}`, true, {
        method: "GET",
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getNewFeed(page?: PageRequest): Page<PostResponse> {
    const res = await apiFetch(`/posts/feed?${toQueryString(page)}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getExplore(page?: PageRequest): Page<PostResponse> {
    const res = await apiFetch(`/posts/explore?${toQueryString(page)}`, true, {
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

export async function sharePost(req: SharePostRequest): Promise<PostResponse> {
    const res = await apiFetch(`/posts/share?originalPostId=${req.originalPostId}&&caption=${req.caption}&&accessScope=${req.accessModifier}`, true, {
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
        formData.append('mediaFiles', media)
    })
    if (post.keepMediaUrls && post.keepMediaUrls.length > 0 ) post.keepMediaUrls.forEach(url => {
        formData.append('keepMediaUrls', url.toString())
    })
    if (post.removeMediaUrls && post.removeMediaUrls.length > 0) post.removeMediaUrls.forEach(url => {
        formData.append('removeMediaUrls', url.toString())
    })
    console.log(post)
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