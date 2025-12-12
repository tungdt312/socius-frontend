"use client"
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useStomp} from "@/components/StompContext"
import {NotificationResponse} from "@/types/dtos/notification"
import {getAllNotification, readAllNotification, readNotification} from "@/services/notifiactionService"
import {toast} from "sonner"
import {Item, ItemContent, ItemDescription, ItemMedia} from "@/components/ui/item";
import Link from "next/link";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Bell, LoaderCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {PostCard} from "@/components/user/Post";


const PAGE_SIZE = 10

const NotificationList = () => {
    const {client, isConnected} = useStomp()

    const [notifications, setNotifications] = useState<NotificationResponse[]>([])
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const observer = useRef<IntersectionObserver | null>(null);
    // Element cuối cùng để trigger load more
    const lastUserElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return; // Đang load thì không trigger

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                // Khi thấy phần tử cuối cùng -> Tăng page lên
                setCurrentPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);
    const FetchData = async () => {
        try {
            const page: PageRequest ={
                page: currentPage,
                size: 10,
                sort: ["createdAt,desc"]
            }
            setIsLoading(true);
            const res = await getAllNotification(page);
            setCurrentPage(res.page)
            setHasMore(res.numberOfElements == res.size)
            setNotifications(prev => {
                // Tạo Set các ID hiện có để tra cứu nhanh
                const existingIds = new Set(prev.map(n => n.id));
                // Lọc ra các item mới từ API mà chưa có trong state hiện tại
                const newItems = res.content.filter(n => !existingIds.has(n.id));

                // Nếu là trang 0 (load lại trang), có thể bạn muốn ghi đè hoặc merge cẩn thận
                // Ở đây mình dùng merge nối đuôi:
                return [...prev, ...newItems];
            });
        } catch (error) {
            toast.error((error as Error).message ?? "Lỗi khi load bài ")
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        FetchData()
    }, [currentPage])

    // 📌 Lắng nghe WebSocket realtime
    useEffect(() => {
        if (client && isConnected) {
            const destination = `/user/queue/notifications`

            const subscription = client.subscribe(destination, (msg) => {
                    const newNoti = JSON.parse(msg.body) as NotificationResponse
                    setNotifications(prev => [newNoti, ...prev])
            })

            return () => subscription.unsubscribe()
        }
    }, [client, isConnected])

    // 📌 Đọc tất cả
    const readAll = async () => {
        try {
            if (!notifications.some(n => !n.read)) return

            await readAllNotification()

            setNotifications(prev => prev.map(n => ({...n, read: true})))
        } catch (e) {
            toast.error((e as Error).message || "Đọc thất bại")
        }
    }

    // 📌 Đọc từng thông báo
    const onReadOne = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? {...n, read: true} : n))
        )
    }

    return (
        <div className="w-full flex flex-col gap-3 items-center">
            <div className="subtitle1 flex w-full justify-between">
                <span>Thông báo</span>
                <span onClick={readAll} className="cursor-pointer">Đọc tất cả</span>
            </div>

            {notifications.length === 0 && <span>Chưa có thông báo nào</span>}

            {notifications.map((noti, index) => {
                if (notifications.length === index + 1) {
                    return (
                        <div ref={lastUserElementRef} key={noti.id} className="w-full">
                            <NotificationItem
                                notification={noti}
                                onRead={() => onReadOne(noti.id)}
                            />
                        </div>
                    );
                }
                return <NotificationItem
                    key={noti.id}
                    notification={noti}
                    onRead={() => onReadOne(noti.id)}
                />
            })}
            {isLoading && (
                <div className="py-4">
                    {/* Hoặc spinner nhỏ nếu load more */}
                    {currentPage > 0 && <LoaderCircle className="animate-spin size-6 mx-auto mt-2 text-muted-foreground"/>}
                </div>
            )}
            {!hasMore && notifications.length > 0 && (
                <span className="text-xs text-muted-foreground py-4">Đã hiển thị hết danh sách</span>
            )}
        </div>
    )
}

export default NotificationList
export const NotificationItem = ({notification}: { notification: NotificationResponse }) => {
    const read = async () => {
        try {
            const res = await readNotification(notification.id)
            notification.read = true
        } catch (e) {
            toast.error((e as Error).message || "Đọc thất bại");
        }
    }
    return (
        <Item className={"p-2 w-full"} asChild onClick={read}>
            <Link href={notification.link}>
                <ItemMedia>
                    <Avatar
                        className={"size-12"}>
                        <AvatarImage src={notification.actor.avatarUrl} className={"object-cover"}/>
                        <AvatarFallback>
                            <Bell size={"80%"}/></AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent className="flex ">
                <ItemDescription
                    className={`w-full body1 overflow-ellipsis line-clamp-3 ${notification.read ? "font-normal" : "font-bold"}`}> {notification.actor.displayName ?? "Hệ thống"} {notification.content ?? "có thông báo mới"} </ItemDescription>
            </ItemContent>
            </Link>
        </Item>)
}