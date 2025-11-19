"use client"
import React, {useEffect, useState} from 'react'
import {MessageResponse} from "@/types/dtos/message";
import {useStomp} from "@/components/StompContext";
import {NotificationResponse} from "@/types/dtos/notification";
import Link from "next/link";
import {Item, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item";
import Image from "next/image";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Bell} from "lucide-react";
import {getConversationById, getConversationMessage} from "@/services/messageService";
import {toast} from "sonner";
import {getAllNotification, readAllNotification, readNotification} from "@/services/notifiactionService";

const NotificationList = () => {
    const {client, isConnected} = useStomp()
    const [notifications, setNotifications] = useState<NotificationResponse[]>([])
    useEffect(() => {
        if (client && isConnected) {

            const destination = `/user/queue/notifications`;

            const subscription = client.subscribe(destination, (noti) => {
                try {
                    const newNoti = JSON.parse(noti.body) as NotificationResponse;
                    setNotifications(prev => [newNoti,...prev]);
                } catch (e) {
                    console.error("Lỗi parse tin nhắn STOMP:", e);
                }
            });

            return () => subscription.unsubscribe();
        }
    }, [client, isConnected]);
    useEffect(() => {
        const fetchNoti = async () => {
            try {
                const res = await getAllNotification()
                setNotifications(res.content)
            } catch (e){
                toast.error((e as Error).message || "Tải thôgn báo thất bại");
            }
        }
        fetchNoti().then();
    }, []);
    const readAll = async () => {
        try {
            if (notifications.length === 0 || !notifications.find(noti => !noti.read)) return
            const res = await readAllNotification()
            notifications.forEach(notification => {notification.read = true})
        } catch (e){
            toast.error((e as Error).message || "Đọc thất bại");
        }
    }
    return (
        <div className="w-full flex flex-col gap-3 items-center">
            <div className={"subtitle1 flex w-full justify-between"}>
                <span>Thông báo</span>
                <span onClick={readAll}>Đọc tất cả</span>
            </div>
            {notifications.length == 0 && (
                <span>Chưa có thông báo nào</span>
            )}
            {(notifications || []).map((notification) => (
                <NotificationItem notification={notification} key={notification.id} />))}
        </div>
    )
}
export default NotificationList


export const NotificationItem = ({notification}:{notification: NotificationResponse}) => {
    const read = async () => {
        try {
            const res = await readNotification(notification.id)
            notification.read = true
        } catch (e){
            toast.error((e as Error).message || "Đọc thất bại");
        }
    }
    return (
        <Item className={"p-2 w-full"} asChild onClick={read}>
            <Link href={notification.link}>
                <ItemMedia>
                    <Avatar className={"size-12"}>
                        <AvatarImage src={notification.actor.avatarUrl} className={"object-cover"}/>
                        <AvatarFallback><Bell  size={"80%"}/></AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent className="flex ">
                    <ItemDescription className={`w-full body1 overflow-ellipsis line-clamp-3 ${notification.read?"font-normal":"font-bold"}`}>
                        {notification.actor.displayName ?? "Hệ thống"} {notification.content ?? "có thông báo mới"}
                    </ItemDescription>
                </ItemContent>
            </Link>
        </Item>
    )
}