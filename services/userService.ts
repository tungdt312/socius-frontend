import {EditUserResquest, UserRelationResponse, UserResponse} from "@/types/dtos/user";
import {apiFetch, processResponse} from "@/services/baseService";
import {BaseResponse, Page} from "@/types/dtos/base";

export async function getMe():Promise<UserResponse>{
    const res = await apiFetch("/users/me", true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}
export async function getUserById(id:string):Promise<UserResponse>{
    const res = await apiFetch(`/users/${id}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}
export async function getUserAndStatusById(id:string):Promise<UserRelationResponse>{
    const res = await apiFetch(`/users/${id}/relation-status`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}
export async function getFollowList(id: string, type: string):Promise<Page<UserRelationResponse>>{
    const res = await apiFetch(`/users/${id}/${type}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}
export async function getUsersList():Promise<Page<UserRelationResponse>>{
    const res = await apiFetch(`/users/search`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}
export async function putMe(data: FormData):Promise<UserResponse>{
    const res = await apiFetch("/users/me", true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
        },
        body: data,
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function follow(targetId: string):Promise<BaseResponse>{
    const res = await apiFetch(`/users/follow?targetId=${targetId}`, true, {
        method: "POST",
        headers: {
            "accept": "application/json",
        }
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function unfollow(targetId: string):Promise<BaseResponse>{
    const res = await apiFetch(`/users/unfollow?targetId=${targetId}`, true, {
        method: "DELETE",
        headers: {
            "accept": "application/json",
        }
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function removefollow(followerId: string):Promise<BaseResponse>{
    const res = await apiFetch(`/users/${followerId}/remove-follower`, true, {
        method: "DELETE",
        headers: {
            "accept": "application/json",
        }
    })
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}