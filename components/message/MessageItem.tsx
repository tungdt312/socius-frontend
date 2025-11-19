"use client";

import {cn, formatISODate} from "@/lib/utils";
import {MessageResponse} from "@/types/dtos/message";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// (Giả sử ChatMessage từ ChatWindow)

interface MessageItemProps {
    message: MessageResponse;
    isMe: boolean;
}

export const MessageItem = ({message, isMe}: MessageItemProps) => {
    return (
        <div className={cn(
            "flex gap-2",
            isMe ? "justify-end" : "justify-start"
        )}>
            {!isMe && (
                <Image
                    alt="avatar"
                    src={message.senderAvatar || process.env.NEXT_PUBLIC_AVATAR_URL!}
                    height={40}
                    width={40}
                    className="size-9 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                />
            )}
            <div className={cn(
                "max-w-[70%] p-3 rounded-lg",
                isMe ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
                <span
                    className={`truncate w-full subtitle2 ${isMe ? "text-primary-foreground" : ""}`}>{message.senderName} - {formatISODate(message.createdAt)}</span>
                {message.content && <p>{message.content}</p>}
                {message.media && <div className={"w-full h-fit flex"}>
                    {message.media.map((media) => (
                        <Link href={media.url} key={media.url} target="_blank">
                            {media.type === "image" ? <Image
                                    src={media.url}
                                    alt="Media bình luận"
                                    width={150}
                                    height={150}
                                    className="mt-2 rounded-lg h-[150px] w-[150px] object-contain"
                                /> :
                                <video
                                    src={media.url}
                                    className="h-[150px] w-[150px] object-contain"
                                    controls muted
                                />}
                        </Link>
                    ))}
                </div>}

            </div>
        </div>
    );
};