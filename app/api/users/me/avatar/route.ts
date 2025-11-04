import {callExternalApi} from "@/lib/fetcher";
import {ErrorResponse} from "@/types/apis/auth";
import {UserResponse} from "@/types/apis/user";

const PATH = "/users/me/avatar";

export async function PUT(req: Request) {
    try {
        const res = await callExternalApi(
            PATH,
            true,
            req
        );
        if (!res.ok) {
            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, {status: res.status});
        }
        const data: UserResponse = await res.json();
        console.log("editAvatar", data);
        return Response.json(data);
    } catch (error: any) {
        throw new Error( error.message);

    }
}