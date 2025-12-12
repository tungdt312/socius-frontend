import {ReportDTO, ReportRequest, ReportReview, ReportStatus} from "@/types/dtos/report";
import {Page, PageRequest, toQueryString} from "@/types/dtos/base";
import {apiFetch, processResponse} from "./baseService";

export async function report(req: ReportRequest): Promise<ReportDTO> {
    const res = await apiFetch("/reports", true, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
        },
        body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function reviewReport(id: string, req: ReportReview): Promise<ReportDTO> {
    const res = await apiFetch(`/moderation/reports/${id}/review`, true, {
        method: "PUT",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
        },
        body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
export async function getReport( status: ReportStatus, page?: PageRequest): Promise<Page<ReportDTO>>{
    const res = await apiFetch(`/moderation/reports?${status?`status=${status}&`: ""}${toQueryString(page)} `, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        }
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

