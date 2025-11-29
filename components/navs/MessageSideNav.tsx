"use client"
import React, {useEffect, useState} from 'react'
import {usePathname} from "next/navigation";
import {getMyConversation} from "@/services/messageService";
import {toast} from "sonner";
import {ConversationResponse, MessageResponse} from "@/types/dtos/message";
import {Page} from "@/types/dtos/base";
import {Input} from "@/components/ui/input";
import Image from "next/image";
import {MessageCircle, SquarePen, UserRound, X} from "lucide-react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {UserListItemSkeleton} from "@/components/user/ListItem";
import {Separator} from "@/components/ui/separator";
import {ConversationForm} from "@/components/message/ConversationForm";
import {Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useStomp} from "@/components/StompContext";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

import {useCurrentUser} from "@/components/userContext";

export const MessageSideNav = () => {
    const user = useCurrentUser();
    const pathName = usePathname()
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [conversations, setConversations] = useState<ConversationResponse[]>([])
    const [page, setPage] = useState<Page<ConversationResponse>>()
    useEffect(() => {
        const FetchConservation = async () => {
            setIsLoading(true)
            try {
                const res = await getMyConversation()
                console.log(res)
                setConversations(res)
            } catch (error) {
                toast.error("Không thể tải cuộc trò chuyện");
            } finally {
                setIsLoading(false);
            }
        }
        FetchConservation().then()
    }, [pathName])
    const filtered = conversations
         .filter((conversation) => {
             if (conversation.title == undefined || conversation.title == "") return false;
             return conversation.title.toLowerCase().includes(search.toLowerCase())
         }
    );
    return (
        <div
            className={`${pathName == "/message" ? "w-full" : "hidden"} p-2 lg:w-[400px] lg:flex flex-col gap-2 border-r-1 border-border`}>
            <div className={"flex justify-between items-center h-fit w-full py-2"}>
                <div className={"flex items-center gap-2 w-fit h-fit"}>
                    <Avatar className={"size-8"}>
                        <AvatarImage src={user.avatarUrl} className={"object-cover"}/>
                        <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                    </Avatar>
                    <span className={"subtitle1 overflow-ellipsis w-full line-clamp-1"}>{user.displayName ?? "Người dùng"}</span>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger>
                        <SquarePen size={24}/>
                    </AlertDialogTrigger>
                    <AlertDialogContent className={"max-h-3/4"}>
                        <AlertDialogHeader className="relative w-full">
                            <AlertDialogTitle
                                className="heading5 text-center w-full">Tạo cuộc trò chuyện</AlertDialogTitle>
                            <AlertDialogCancel className="size-fit !p-1 aspect-square absolute right-0 rounded-full">
                                <X/>
                            </AlertDialogCancel>
                        </AlertDialogHeader>
                        <Separator/>
                        <ConversationForm onSuccess={(p) => setConversations(prevState => [p,...prevState])}/>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <Input className="flex w-full items-center gap-2 "
                   type="text"
                   placeholder="Tìm kiếm"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
            />
            <div className={"w-full"}>
                {filtered.map(conversation => (
                    <ConversationItem conversation={conversation}  key={conversation.id} />
                ))}
                {isLoading && <UserListItemSkeleton/>}
            </div>
        </div>
    )
}

export const ConversationItem = ({conversation}: { conversation: ConversationResponse }) => {
    const [message, setMessage] = useState(conversation.lastMessage?.content || "Chưa có tin nhắn nào");
    const {client, isConnected} = useStomp();
    useEffect(() => {
        if (client && isConnected && conversation.id) {

            const destination = `/queue/conversation/${conversation.id}`;

            const subscription = client.subscribe(destination, (message) => {
                try {
                    const newMsg = JSON.parse(message.body) as MessageResponse;
                    setMessage(newMsg.content);
                } catch (e) {
                    console.error("Lỗi parse tin nhắn STOMP:", e);
                }
            });

            return () => subscription.unsubscribe();
        }
    }, [client, isConnected])
    return (
        <Item className={"p-2"} asChild>
            <Link href={`/message/${conversation.id}`}>
                <ItemMedia>
                    <Avatar className={"size-8"}>
                        <AvatarImage src={conversation?.mediaUrl} className={"object-cover"}/>
                        <AvatarFallback><MessageCircle  size={"80%"}/></AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent className="flex items-start flex-1">
                    <ItemTitle className={"flex-1 overflow-ellipsis line-clamp-1"}>
                        {conversation.title ?? "Cuộc trò chuyện"}
                    </ItemTitle>
                    <ItemDescription className={`flex-1 overflow-ellipsis line-clamp-1 text-muted-foreground body1 `}>
                        {message ? message : "Chưa có tin nhắn nào"}
                    </ItemDescription>
                </ItemContent>
            </Link>
        </Item>
    )
}
