import { ErrorResponse } from "@/types/apis/auth";
import { callExternalApi } from "@/lib/fetcher";
import { UserResponse } from "@/types/apis/user";

const PATH = "/users/follow";
const DELETEPATH = "/users/unfollow";

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("targetId");

    if (!userId) {
        return Response.json(
            { message: "Missing userId parameter" },
            { status: 400 }
        );
    }

    try {
        const res = await callExternalApi(
            `${PATH}?targetId=${userId}`,
            true,
            req
        );

        if (!res.ok) {
            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, { status: res.status });
        }

        const data = await res.json();
        return Response.json(data);
    } catch (error) {
        return Response.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("targetId");

    if (!userId) {
        return Response.json(
            { message: "Missing userId parameter" },
            { status: 400 }
        );
    }

    try {
        const res = await callExternalApi(
            `${DELETEPATH}?targetId=${userId}`,
            true,
            req
        );

        if (!res.ok) {
            const errorData: ErrorResponse = await res.json();
            return Response.json(errorData, { status: res.status });
        }

        const data = await res.json();
        return Response.json(data);
    } catch (error) {
        return Response.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
