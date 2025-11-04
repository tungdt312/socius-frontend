import {EditUserResquest, UserResponse} from "@/types/dtos/user";
import {apiFetch} from "@/services/baseService";

export async function getMe():Promise<UserResponse>{
    const res = await apiFetch("/user/me", true, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
        },
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}
export async function putMe(data: FormData):Promise<UserResponse>{
    const res = await apiFetch("/user/me", true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
        },
        body: data,
    })
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}