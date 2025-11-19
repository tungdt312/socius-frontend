"use client"
import React, {useEffect} from 'react'
import {Input} from "@/components/ui/input";
import {getFriendsList} from "@/services/friendService";
import {UserRelationResponse} from "@/types/dtos/user";
import {toast} from "sonner";
import {Item, ItemActions, ItemContent, ItemMedia, ItemTitle} from "@/components/ui/item";
import Image from "next/image";
import {LoaderCircle, Send, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ConversationResponse, ConversationResquest} from "@/types/dtos/message";
import {postConversation} from "@/services/messageService";

interface Props {
    onSuccess: (p: ConversationResponse) => void
}

export const ConversationForm = ({onSuccess}: Props) => {
    const [search, setSearch] = React.useState<string>('')
    const [friends, setFriends] = React.useState<UserRelationResponse[]>([])
    const [loading, setLoading] = React.useState(false)
    const [members, setMembers] = React.useState<UserRelationResponse[]>([])
    const [isCreating, setIsCreating] = React.useState(false)
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setLoading(true)
                const res = await getFriendsList()
                setFriends(friends.concat(res.content ?? []))
            } catch (error) {
                toast.error((error as Error).message ?? "Lỗi khi tải bạn bè ")
            } finally {
                setLoading(false)
            }
        }
        fetchFriends().then()
    }, [])
    const filtered = friends
        .filter((friend) => {
                return friend.displayName.toLowerCase().includes(search.toLowerCase())
            }
        );
    const createConversation = async () => {
        try {
            setIsCreating(true)
            const req: ConversationResquest = {
                isGroup: true,
                title: "Cuộc trò chuyện",
                memberIds: members.map((member) => member.id),
            }
            const res = await postConversation(req)
            onSuccess(res)
            toast.success("Cuộc trò chuyện đã được tạo")
        } catch (e) {
            toast.error((e as Error).message || "Không thể tạo cuộc trò chuyện")
        } finally {
            setIsCreating(false)
        }
    }
    return (
        <div className={"flex-1 w-full gap-2"}>
            <Input className="flex w-full items-center gap-2 "
                   type="text"
                   placeholder="Tìm kiếm"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
            />
            {members.length > 0 &&
                (<div className={"flex gap-2 w-full overflow-auto py-2"}>
                    Đến:
                    {members.map((member) => (
                        <MemberItem member={member} onRemove={() => {
                            setMembers(members.filter((p) => {
                                return member.id != p.id
                            }))
                        }
                        }/>
                    ))}
                </div>)
            }
            <div className={"flex flex-col items-center w-full flex-1 overflow-auto gap-2"}>
                {friends.map((friend) => (
                    <FriendItem key={friend.id} friend={friend}
                                onSelect={() => setMembers(members.concat(friend))}/>)
                )}
                {loading && (<p className={"w-fit"}><LoaderCircle className={"animate-spin ml-1"}/> Đang tải...</p>)}
            </div>
            <Button className={"w-full"} type="submit" onClick={createConversation} disabled={isCreating || members.length === 0}>
                {isCreating && <LoaderCircle className={"animate-spin"}/>}
                Tạo
            </Button>
        </div>
    )
}


export const MemberItem = ({member, onRemove}: { member: UserRelationResponse, onRemove: () => void }) => {
    return (
        <div className={"flex rounded-full items-center gap-1 bg-primary-foreground text-primary p-1 w-fit h-fit"}>
            {member.displayName}
            <X onClick={onRemove} className={"size-6 cursor-pointer"}/>
        </div>
    )
}

export const FriendItem = ({friend, onSelect}: { friend: UserRelationResponse, onSelect: () => void }) => {
    return (
        <Item className={"flex w-full"}>
            <ItemMedia>
                <Image
                    src={friend.avatarUrl ?? process.env.NEXT_PUBLIC_AVATAR_URL}
                    alt={friend.displayName ?? ""}
                    width={44}
                    height={44}
                    className="size-8 object-cover  rounded-full  mx-auto"
                    loading={"lazy"}
                />
            </ItemMedia>
            <ItemContent className="flex-row flex flex-1 items-center justify-between w-full">
                <ItemTitle>
                    <p className={"truncate flex-1 overflow-ellipsis"}>{friend.displayName}</p>
                </ItemTitle>
                <ItemActions>
                    <Button
                        size={"sm"}
                        onClick={onSelect}
                    >
                        Thêm
                    </Button>
                </ItemActions>
            </ItemContent>
        </Item>
    )
}