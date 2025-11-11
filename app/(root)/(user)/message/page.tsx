import React from 'react'
import {Button} from "@/components/ui/button";
import EmojiPicker from "emoji-picker-react";
import {MessageCircle} from "lucide-react";

const Page = () => {
    return (
        <div className={"hidden lg:flex flex-col gap-2 w-full h-full p-4 items-center justify-center bg-background text-foreground"}>
            <MessageCircle size={100} className={"text-primary"} />
            <p className={"heading3"}>Tin nhắn của bạn</p>
            <p>Gửi ảnh và tin nhắn cho bạn bè của bạn</p>
            <Button>Gửi tin nhắn</Button>
        </div>
    )
}
export default Page
