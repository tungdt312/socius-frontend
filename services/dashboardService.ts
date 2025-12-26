import {Page, PageRequest, toQueryString} from "@/types/dtos/base";
import {PostResponse} from "@/types/dtos/post";
import {apiFetch, processResponse} from "@/services/baseService";
import {DashboardItem, DashboardSummary, ModeratorSummary, StatsRequest} from "@/types/dtos/dashboard";

export async function getDashboardSummary(): Promise<DashboardSummary>{
    const res = await apiFetch(`/dashboard/summary`, true, {
        method: "GET",
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getDashboardStats(req: StatsRequest): Promise<DashboardItem[]>{
    const res = await apiFetch(`/dashboard/stats?type=${req.type}&targetType=${req.targetType}&time=${req.time}`, true, {
        method: "GET",
    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}

export async function getDashboardModeration(): Promise<ModeratorSummary>{
    const res = await apiFetch(`/dashboard/moderation`, true, {
        method: "GET",

    })
    if (!res.ok) throw new Error(res.statusText)
    return processResponse(res)
}