import {callExternalApi} from "@/lib/fetcher";
import {ErrorResponse} from "@/types/apis/auth";
import {Page} from "@/types/apis/base";
import {UserRelationResponse} from "@/types/apis/user";

export async function GET(req: Request, {params}: { params: { id: string } }) {
    try {
        const id = (await params).id;
        const {searchParams} = new URL(req.url);

        // Lấy các query params nếu có
        const page = searchParams.get("page") ?? "0";
        const size = searchParams.get("size") ?? "10";
        const sort = searchParams.getAll("sort"); // nếu sort là mảng

        // Gắn query string vào URL ngoài
        const query = new URLSearchParams({ page, size });
        sort.forEach((s) => query.append("sort", s));
        const res = await callExternalApi(
            `/users/${id}/following?${query.toString()}`,
            true,
            req
        );
        if (!res.ok) {
            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, {status: res.status});
        }
        const data: Page<UserRelationResponse> = await res.json();
        console.log("getfollowing", data);
        return Response.json(data);
    } catch (error) {
        throw new Error( error.message);

    }
}