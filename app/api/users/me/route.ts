// app/api/auth/login/route.ts
import {ErrorResponse} from "@/types/apis/auth";
import {callExternalApi} from "@/lib/fetcher";
import {UserResponse} from "@/types/apis/user";

const PATH = "/users/me";

export async function GET(req: Request) {
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
        console.log("getUser", data);
        return Response.json(data);
    } catch (error) {
        throw new Error( "getUser");

    }
}

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
        console.log("editUser", data);
        return Response.json(data);
    } catch (error) {
        throw new Error( "editUser");

    }
}
