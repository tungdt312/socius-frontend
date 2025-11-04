"use client"
import React, {useState} from 'react'
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {UserRelationResponse} from "@/types/dtos/user";
import {FriendActionTypes, FriendshipStatus} from '@/constants/enum';
import {ChevronDown} from "lucide-react";
import {BASE} from "@/lib/utils";
import {globalState} from "@/lib/token";
import {useRouter} from "next/navigation";

export const FollowButton =  ({user}: { user: UserRelationResponse }) => {
    const router = useRouter()
    const [isFollowing, setIsFollowing] = useState(user.following);

    const FollowHandle = async (isFollowing: boolean) => {
        try {
            const res = await fetch(`${BASE}/api/users/follow?targetId=${user.id}`, {
                method: (isFollowing) ? "DELETE" : "POST",
            })
            if (!res.ok) {
                toast.error((isFollowing) ? "Hủy theo dõi thất bại" : "Theo dõi thất bại")
                return 0
            }
            router.refresh()
            setIsFollowing(!isFollowing);
        } catch (error) {
            throw new Error("Action Failed")
        }
    }
    if (isFollowing) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button className={"grow flex items-center"} variant={"outline"}>
                        Đang theo dõi
                        <ChevronDown/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                    <Button className={"grow"}  onClick={() => {FollowHandle(isFollowing)}} variant={"ghost"}>
                        Hủy theo dõi
                    </Button>
                </PopoverContent>
            </Popover>
        )
    }
    else return (
        <Button onClick={() => {FollowHandle(isFollowing)}}>
            Theo dõi
        </Button>
    )
}

export const FriendButton =  ({user}: { user: UserRelationResponse }) => {
    const router = useRouter()
    const [state, setState] = useState<FriendshipStatus>(user.friendship.status ?? FriendshipStatus.NONE)
    const [isSend, setIsSend] = useState<boolean>(globalState.owner?.id === (user.friendship.senderId ?? -1))

    const HandleAction = async (type: FriendActionTypes) => {
        try {
            const res = await fetch(`${BASE}/api/friends?type=${type}&&targetId=${user.id}`, {
                method: [FriendActionTypes.unblock, FriendActionTypes.unfriend].includes(type as FriendActionTypes)
                    ? "DELETE" : "POST",
            })
            if (!res.ok) {
                toast.error("Thao tác thất bại")
                return 0
            }
            router.refresh()
            return 1
        } catch (error) {
            throw new Error("Action failed")
        }
    };
    if (state == FriendshipStatus.PENDING){
        if (isSend) return (
            <Button variant={"outline"} onClick={()=>{
                HandleAction(FriendActionTypes.unsend).then(r => {
                    if (r == 1) {
                        setState(FriendshipStatus.NONE)
                        setIsSend(false)
                    }
                })
            }}>
                Gỡ lời mời
            </Button>
        )
        else return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button className={"grow"} variant={"outline"}>
                        Phản hồi kết bạn
                        <ChevronDown/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0 flex-col">
                    <Button className={"w-full"}  onClick={() => {
                        HandleAction(FriendActionTypes.accept).then(r => {
                            if (r == 1) {
                                setState(FriendshipStatus.FRIEND)
                                setIsSend(false)
                            }
                        })
                    }} variant={"ghost"}>
                        Chấp nhận
                    </Button>
                    <Button className={"w-full !text-destructive"}  onClick={() => {
                        HandleAction(FriendActionTypes.reject).then(r => {
                            if (r == 1) {
                                setState(FriendshipStatus.NONE)
                                setIsSend(false)
                            }
                        })
                    }} variant={"ghost"}>
                        Từ chối
                    </Button>
                </PopoverContent>
            </Popover>
        )
    }
    else if (state == FriendshipStatus.FRIEND){
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button className={"grow"} variant={"outline"}>
                        Bạn bè
                        <ChevronDown/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                    <Button className={"grow !text-destructive"}  onClick={() => {
                        HandleAction(FriendActionTypes.unfriend).then(r => {
                            if (r == 1) {
                                setState(FriendshipStatus.NONE)
                                setIsSend(false)
                            }
                        })
                    }} variant={"ghost"}>
                        Hủy kết bạn
                    </Button>
                </PopoverContent>
            </Popover>
        )
    }
    else {
        return (
            <Button onClick={()=>{
                HandleAction(FriendActionTypes.send).then(r => {
                    if (r == 1) {
                        setState(FriendshipStatus.PENDING)
                        setIsSend(true)
                    }
                })
            }}>
                Kết bạn
            </Button>
        )
    }
}