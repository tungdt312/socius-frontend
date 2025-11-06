import {BaseResponse, Page} from "@/types/dtos/base";
import {CommentRequest, CommentResponse, EditCommentRequest, PostResponse} from "@/types/dtos/post";
import {apiFetch, processResponse} from "@/services/baseService";

export async function getPostsComments(postId: string): Promise<Page<CommentResponse>> {
    const res = await apiFetch(`/comments/post/${postId}`, true, {
        method: "GET",
    } )
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getCommentReplies(commentId: string): Promise<Page<CommentResponse>> {
    const res = await apiFetch(`/comments/${commentId}/replies`, true,{
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    } )
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function comment(comment: CommentRequest): Promise<CommentResponse> {
    const formData = new FormData()
    const {postId, content, parentId, mediaFile} = comment
    if(postId) formData.append('postId', postId)
    if(parentId) formData.append('parentId', parentId)
    if(content) formData.append('content', content)
    if(mediaFile) formData.append('mediaFile', mediaFile)

    const res = await apiFetch(`/comments/create`, true, {
        method: "POST",
        headers: {
            "accept": "application/json",
        },
        body: formData,
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function editComment(comment: EditCommentRequest): Promise<CommentResponse> {
    const formData = new FormData()
    const {commentId, content, removeImage, imageFile} = comment
    if(commentId) formData.append('commentId', commentId)
    if(content) formData.append('content', content)
    if(removeImage) formData.append('removeImage', String(removeImage))
    if(imageFile) formData.append('imageFile', imageFile)

    const res = await apiFetch(`/comments/update`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
        },
        body: formData,
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function deleteComment(commentId: string): Promise<BaseResponse> {
    const res = await apiFetch(`/comments/${commentId}`, true, {
        method: "DELETE",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}