import {UserRelationResponse} from "@/types/dtos/user";
import {BaseResponse, Page} from "@/types/dtos/base";
import {apiFetch, processResponse} from "@/services/baseService";

export async function getFriendsList(
    type?: string,
    userId?: string
): Promise<Page<UserRelationResponse>> {

    let url = "/friends";

    if (type) {
        url = `/friends/${type}`; // Sẽ thành /api/v1/friends/pending
    } else if (userId) {
        url = `/friends/${userId}`; // Sẽ thành /api/v1/friends/123
    }

    const res = await apiFetch(url, true, {
        method: 'GET',
        headers: {
            "accept": "application/json",
        }
    });
    return processResponse(res);
}
export async function postFriendAction(targetId: string, type: string): Promise<BaseResponse> {
    let target = "targetId"
    if (type === "accept" || type === "reject") target = "requesterId"
    const res = await apiFetch(`/friends/${type}?${target}=${targetId}`, true, {
        method: "POST",
        headers: {
            "accept": "application/json",
        }
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function deleteFriendAction(targetId: string, type: string): Promise<BaseResponse> {
    let target = "targetId"
    if (type === "unfriend") target = "friendId"
    const res = await apiFetch(`/friends/${type}?${target}=${targetId}`, true, {
        method: "DELETE",
        headers: {
            "accept": "application/json",
        }
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

