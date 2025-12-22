"use client";

import {cn, formatISODate} from "@/lib/utils";
import {MessageResponse} from "@/types/dtos/message";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "../ui/button";
import {Flag, MoreVertical} from "lucide-react";
import ReportForm from "../moderator/ReportForm";
import {ReportableType} from "@/types/dtos/report";

// (Giả sử ChatMessage từ ChatWindow)

interface MessageItemProps {
    message: MessageResponse;
    isMe: boolean;
}

export const MessageItem = ({message, isMe}: MessageItemProps) => {
    const isDeleted = !!message.deletedAt;

    // --- HIỂN THỊ TIN NHẮN ĐÃ XÓA (VI PHẠM) ---
    if (isDeleted) {
        // Tin nhắn bị xóa chỉ hiển thị ở phía người gửi (isMe)
        // Nếu không phải người gửi, tin nhắn này sẽ không được render (hoặc đã được lọc ở component cha)
        if (!isMe) {
            return null; // Người nhận không thấy tin nhắn bị xóa
        }

        // Người gửi thấy tin nhắn đã bị làm mờ
        return (
            <div className="flex justify-end">
                <div className="max-w-[70%] p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 opacity-60 italic">
                    <p className="font-medium">Tin nhắn này đã bị xóa</p>
                    <p className="text-xs">Do vi phạm tiêu chuẩn cộng đồng.</p>
                </div>
            </div>
        );
    }
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
            {/*{!isMe && <DropdownMenu>*/}
            {/*    <DropdownMenuTrigger asChild>*/}
            {/*        <Button variant="ghost" size="icon">*/}
            {/*            <MoreVertical className="size-4"/>*/}
            {/*        </Button>*/}
            {/*    </DropdownMenuTrigger>*/}
            {/*    <DropdownMenuContent align={isMe ? "end" : "start"} className="w-40">*/}
            {/*        {!isMe && (*/}
            {/*            <ReportForm targetType={ReportableType.MESSAGE} targetId={message.id}>*/}
            {/*                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>*/}
            {/*                    <Flag className="mr-2 h-4 w-4 text-red-500"/>*/}
            {/*                    Báo cáo*/}
            {/*                </DropdownMenuItem>*/}
            {/*            </ReportForm>*/}
            {/*        )}*/}
            {/*    </DropdownMenuContent>*/}
            {/*</DropdownMenu>}*/}
        </div>
    );
};