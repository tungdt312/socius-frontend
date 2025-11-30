import {EditUserResquest, UserRelationResponse, UserResponse} from "@/types/dtos/user";
import {apiFetch, processResponse} from "@/services/baseService";
import {BaseResponse, Page} from "@/types/dtos/base";
import {StaffRequest, UserViewRequest, UserViewResponse} from "@/types/dtos/userview";


export async function getUserViewById(id:string):Promise<UserViewResponse>{
    const res = await apiFetch(`/admin/activity/${id}`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function getUserViewList():Promise<Page<UserViewResponse>>{
    const res = await apiFetch(`/admin/activity`, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function putUserView(req: UserViewRequest, id: string):Promise<UserViewResponse>{

    const res = await apiFetch(`/admin/activity/${id}`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function deleteUser(id: string):Promise<BaseResponse>{
    const res = await apiFetch(`/admin/activity/${id}`, true, {
        method: "DELETE",
        headers: {
            "accept": "application/json",
        }
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function createStaff(req: StaffRequest):Promise<BaseResponse>{

    const res = await apiFetch(`/admin/activity/create-staff`, true, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}