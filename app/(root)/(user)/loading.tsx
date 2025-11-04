import {Separator} from "@/components/ui/separator";
import React from "react";
import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return <div className={"flex flex-col gap-4 mx-auto w-full min-h-full h-fit p-4 bg-secondary text-secondary-foreground"}>
        <p className={"subtitle1 mx-auto"}>Đang tải...</p>
    </div>
};