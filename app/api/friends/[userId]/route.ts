import {callExternalApi} from "@/lib/fetcher";
import {ErrorResponse} from "@/types/apis/auth";
import {UserRelationResponse, UserResponse} from "@/types/apis/user";
import {Page} from "@/types/apis/base";

const PATH = "/friends/";

export async function GET(req: Request,  {params}: { params: { userId: string }}) {
    try {
        const res = await callExternalApi(
            PATH + `${(await params).userId}`,
            true,
            req
        );
        if (!res.ok) {
            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, {status: res.status});
        }
        const data: Page<UserRelationResponse> = await res.json();
        return Response.json(data);
    } catch (error) {
        throw new Error("Load Friend Failed");

    }
}