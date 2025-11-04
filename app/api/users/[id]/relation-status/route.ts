import {callExternalApi} from "@/lib/fetcher";
import {ErrorResponse} from "@/types/apis/auth";
import {UserRelationResponse, UserResponse} from "@/types/apis/user";

const PATH = "/users/";

export async function GET(req: Request,
                          {params}: { params: { id: string } }) {
    try {
        const res = await callExternalApi(
            PATH + `${(await params).id}/relation-status`,
            true,
            req
        );
        if (!res.ok) {
            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, {status: res.status});
        }
        const data: UserRelationResponse = await res.json();
        console.log("getUser", data);
        return Response.json(data);
    } catch (error: any) {
        throw new Error( error.message);
    }
}