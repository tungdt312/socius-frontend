import {apiFetch, processResponse} from "@/services/baseService";
import {BaseResponse, Page} from "@/types/dtos/base";
import {ConversationResponse, ConversationResquest, MessageRequest, MessageResponse} from "@/types/dtos/message";

export async function postConversation(req: ConversationResquest): Promise<ConversationResponse> {
    const formData = new FormData();
    if (req.isGroup) formData.append("isGroup", String(req.isGroup));
    if (req.title) formData.append("title", req.title);
    if (req.media) formData.append("media", req.media);
    if (req.memberIds && req.memberIds.length > 0) req.memberIds.forEach(memberId => {
        formData.append("memberIds", memberId);
    })

    const res = await apiFetch(`/conversations/create`, true, {
        method: "POST",
        headers: {
            "accept": "application/json",
        },
        body: formData,
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}
export async function getConversationById(id:string ): Promise<ConversationResponse> {
    const res = await apiFetch(`/conversations/${id}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getMyConversation(): Promise<ConversationResponse[]> {
    const res = await apiFetch(`/conversations/me`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}
export async function leaveConversation(id: string): Promise<BaseResponse> {
    const res = await apiFetch(`/conversations/${id}/leave`, true, {
        method: "DELETE",
        headers: {
            "accept": "application/json",
        }
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}
export async function addMember(conversationsId:string, userIds: string[]): Promise<ConversationResponse> {
    const req = {
        conversationId: conversationsId ,
        userIds: userIds }
    const res = await apiFetch(`/conversations/addMembers`, true, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}
export async function delMember(conversationId: string, memberId: string): Promise<ConversationResponse> {
    const res = await apiFetch(`/conversations/${conversationId}/members/${memberId}`, true, {
        method: "DELETE",
        headers: {
            "accept": "application/json",
        }
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function editConversation(id:string, req: ConversationResquest): Promise<ConversationResponse> {
    const formData = new FormData();
    formData.append("conversationId", id);
    if (req.title) formData.append("title", req.title);
    if (req.media) formData.append("mediaFile", req.media);
    const res = await apiFetch(`/conversations/update`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
        },
        body: formData,
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}
//message
export async function getConversationMessage(id: String): Promise<MessageResponse[]> {
    const res = await apiFetch(`/messages/${id}/all`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
return processResponse(res)
}

export async function sendMessage(req: MessageRequest): Promise<MessageResponse> {
    const formData = new FormData();
    formData.append('conversationId', req.conversationId);
    if(req.replyToId) formData.append("replyToId", req.replyToId)
    if(req.content) formData.append("content", req.content)
    if(req.mediaFiles && req.mediaFiles.length > 0) req.mediaFiles.forEach(file => { formData.append("mediaFiles", file) })
    const res = await apiFetch(`/messages`, true, {
        method: "POST",
        headers: {
            "accept": "application/json",
        },
        body: formData,
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}