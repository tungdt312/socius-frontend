"use client";

import {Button} from "@/components/ui/button";
import {RefreshCw} from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex flex-col gap 2 items-center justify-center bg-background text-foreground h-screen text-center p-4">
            <h2 className="heading2 font-semibold ">Đã xảy ra lỗi 😢</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => reset()} className={"w-fit"}>
                <RefreshCw/>
                Thử lại
            </Button>
        </div>
    );
}
