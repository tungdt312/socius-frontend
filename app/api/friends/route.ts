import {callExternalApi} from "@/lib/fetcher";
import {ErrorResponse} from "@/types/apis/auth";
import {UserRelationResponse, UserResponse} from "@/types/apis/user";
import {Page} from "@/types/apis/base";

const PATH = "/friends";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const endpoint = type ? `/${type}` : "";

        const res = await callExternalApi(PATH + endpoint, true, req);
        if (!res.ok) {
            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, { status: res.status });
        }

        const data: Page<UserRelationResponse> = await res.json();
        return Response.json(data);
    } catch (error) {
        return Response.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

const target: Record<string, string> = {
    "accept": "requesterId",
    "reject": "requesterId",
    "send": "targetId",
    "unsend": "targetId",
    "block": "targetId",
    "unfriend": "friendId",
    "unblock": "targetId",
    "": "targetId",
}

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const targetId = searchParams.get("targetId");

        if (!type || !targetId) {
            return Response.json(
                { message: "Missing required parameters" },
                { status: 400 }
            );
        }

        const paramKey = target[type];
        const endpoint = `/${type}?${paramKey}=${targetId}`;

        const res = await callExternalApi(PATH + endpoint, true, req);
        if (!res.ok) {
            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, { status: res.status });
        }

        return Response.json(await res.json());
    } catch (error) {
        return Response.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}


export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const targetId = searchParams.get("targetId");

        if (!type || !targetId) {
            return Response.json(
                { message: "Missing required parameters" },
                { status: 400 }
            );
        }

        const paramKey = target[type];
        const endpoint = `/${type}?${paramKey}=${targetId}`;

        const res = await callExternalApi(PATH + endpoint, true, req);
        if (!res.ok) {
            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, { status: res.status });
        }

        return Response.json(await res.json());
    } catch (error) {
        return Response.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
