import React from "react";

export default function Loading() {
    return <div className={"flex flex-col gap-4 mx-auto w-full min-h-full h-fit p-4 bg-background text-foreground"}>
        <p className={"subtitle1 mx-auto"}>Đang tải...</p>
    </div>
};