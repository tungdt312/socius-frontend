import {BaseResponse, Page} from "@/types/dtos/base";
import {CommentResponse, ReactRequest} from "@/types/dtos/post";
import {apiFetch, processResponse} from "@/services/baseService";

export async function react(req: ReactRequest): Promise<BaseResponse> {
    const res = await apiFetch(`/reacts/toggle`, true, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "accept": "application/json",
        },
        body: JSON.stringify(req),
    } )
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}