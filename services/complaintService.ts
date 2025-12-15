import {
    ComplaintRequest,
    ComplaintResponse,
    ReportRequest,
    ReportResponse,
} from "@/types/dtos/report";
import {apiFetch, processResponse} from "@/services/baseService";
import {Page, PageRequest, toQueryString} from "@/types/dtos/base";

export async function complaint(req: ComplaintRequest): Promise<ComplaintResponse> {
    const res = await apiFetch("/complaints", true, {
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

export async function getComplaints( page?: PageRequest): Promise<Page<ComplaintResponse>>{
    const res = await apiFetch(`/complaints?${toQueryString(page)} `, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        }
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}

export async function getComplaintById( id: string): Promise<ComplaintResponse>{
    const res = await apiFetch(`/complaints/${id} `, true, {
        method: "GET",
        headers: {
            "accept": "application/json",
        }
    });
    if (!res.ok) throw new Error(res.statusText);
    return processResponse(res);
}
