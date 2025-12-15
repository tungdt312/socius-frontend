import {ComplaintResponse, ReportableType, ReportRequest, ReportResponse} from "@/types/dtos/report";
import {apiFetch, processResponse} from "@/services/baseService";
import {BaseResponse, Page, PageRequest, toQueryString} from "@/types/dtos/base";
import {ModeratorMessage, ModeratorUser} from "@/types/dtos/moderator";
import {CommentResponse, PostResponse} from "@/types/dtos/post";

export async function unblockUser(id: string, reason: string): Promise<BaseResponse> {
    const res = await apiFetch(`/moderation/users/${id}/unblock`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
        },
        body: JSON.stringify({reason: reason}),
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function blockUser(id: string, reason: string): Promise<BaseResponse> {
    const res = await apiFetch(`/moderation/users/${id}/block`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
        },
        body: JSON.stringify({reason: reason}),
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function getUsers(page: PageRequest): Promise<Page<ModeratorUser>> {
    const res = await apiFetch(`/moderation/users`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function getUserById(id: string): Promise<ModeratorUser> {
    const res = await apiFetch(`/moderation/users/${id}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function getUserViolationsById(id: string): Promise<Page<ReportResponse>> {
    const res = await apiFetch(`/moderation/users/${id}/violations`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function unblock(id: string, type: ReportableType): Promise<BaseResponse> {
    const res = await apiFetch(`/moderation/${type}/${id}/unblock`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function block(id: string, type: ReportableType): Promise<BaseResponse> {
    const res = await apiFetch(`/moderation/${type}/${id}/block`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function getReportsByContent(id: string, type: ReportableType, page:PageRequest): Promise<Page<ReportResponse>> {
    const res = await apiFetch(`/moderation/${type}/${id}/reports?${toQueryString(page)}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function getComplaintsByContent(id: string, type: ReportableType, page:PageRequest): Promise<Page<ComplaintResponse>> {
    const res = await apiFetch(`/moderation/${type}/${id}/reports?${toQueryString(page)}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function getPosts(page: PageRequest): Promise<Page<PostResponse>> {
    const res = await apiFetch(`/moderation/posts/flagged`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function getPostById(id: string): Promise<PostResponse> {
    const res = await apiFetch(`/moderation/post/${id}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function getComments(page: PageRequest): Promise<Page<CommentResponse>> {
    const res = await apiFetch(`/moderation/comments/flagged`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function getCommentById(id: string): Promise<CommentResponse> {
    const res = await apiFetch(`/moderation/comment/${id}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function getMessages(page: PageRequest): Promise<Page<CommentResponse>> {
    const res = await apiFetch(`/moderation/comments/flagged`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function getMessageById(id: string): Promise<ModeratorMessage> {
    const res = await apiFetch(`/moderation/comment/${id}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}