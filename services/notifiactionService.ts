import {ConversationResponse, ConversationResquest} from "@/types/dtos/message";
import {apiFetch, processResponse} from "@/services/baseService";
import {BaseResponse, Page, PageRequest, toQueryString} from "@/types/dtos/base";
import {NotificationResponse} from "@/types/dtos/notification";

export async function readNotification(id:string): Promise<BaseResponse> {

    const res = await apiFetch(`/notifications/${id}/read`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}
export async function readAllNotification(): Promise<BaseResponse> {

    const res = await apiFetch(`/notifications/read-all`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getAllNotification(page?: PageRequest): Promise<Page<NotificationResponse>> {

    const res = await apiFetch(`/notifications?${toQueryString(page)}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}