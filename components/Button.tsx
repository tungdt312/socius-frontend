"use client"
import React, {useEffect, useState} from 'react'
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {UserRelationResponse, UserResponse} from "@/types/dtos/user";
import {FriendActionTypes, FriendshipStatus} from '@/constants/enum';
import {ChevronDown, EllipsisVertical} from "lucide-react";
import {BASE} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {USER_KEY} from "@/constants";
import {deleteFriendAction, postFriendAction} from "@/services/friendService";
import {follow, unfollow} from "@/services/userService";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";

export const FollowButton = ({user}: { user: UserRelationResponse }) => {
    const [isFollowing, setIsFollowing] = useState(user.following);

    const FollowHandle = async (isFollowing: boolean) => {
        try {
            const res = isFollowing ? await unfollow(user.id) : await follow(user.id);
            setIsFollowing(!isFollowing);
        } catch (error) {
            toast.error((error as Error).message ?? "Lỗi không xác định")
        }
    }
    if (isFollowing) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button className={"flex items-center"} variant={"outline"}>
                        Đang theo dõi
                        <ChevronDown/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                    <Button className={"grow"} onClick={() => {
                        FollowHandle(isFollowing)
                    }} variant={"ghost"}>
                        Hủy theo dõi
                    </Button>
                </PopoverContent>
            </Popover>
        )
    } else return (
        <Button onClick={() => {
            FollowHandle(isFollowing)
        }}>
            Theo dõi
        </Button>
    )
}

export const FriendButton = ({user}: { user: UserRelationResponse }) => {
    const router = useRouter()
    const [state, setState] = useState<FriendshipStatus>(user.friendship.status ?? FriendshipStatus.NONE)
    const [isSend, setIsSend] = useState<boolean>(false);
    console.log(user)
    useEffect(() => {
        const ownerDataString = localStorage.getItem(USER_KEY);
        const ownerData: UserResponse | null = ownerDataString ? JSON.parse(ownerDataString) : null;
        setIsSend(user.friendship.senderId === ownerData?.id)
    }, []);
    const HandleAction = async (type: FriendActionTypes) => {
        try {
            const res = (type == "unfriend") ? await deleteFriendAction(user.id, type) : await postFriendAction(user.id, type)
            router.refresh()
            return 1
        } catch (error) {
            toast.error((error as Error).message ?? "Lỗi không xác định")
            return 0
        }
    };
    if (state == FriendshipStatus.PENDING) {
        if (isSend) return (
            <Button variant={"outline"} onClick={() => {
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
                    <Button variant={"outline"}>
                        Phản hồi kết bạn
                        <ChevronDown/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0 flex-col">
                    <Button className={"w-full"} onClick={() => {
                        HandleAction(FriendActionTypes.accept).then(r => {
                            if (r == 1) {
                                setState(FriendshipStatus.FRIEND)
                                setIsSend(false)
                            }
                        })
                    }} variant={"ghost"}>
                        Chấp nhận
                    </Button>
                    <Button className={"w-full !text-destructive"} onClick={() => {
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
    } else if (state == FriendshipStatus.FRIEND) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"}>
                        Bạn bè
                        <ChevronDown/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                    <Button className={"grow !text-destructive"} onClick={() => {
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
    } else {
        return (
            <Button onClick={() => {
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

export const BlockButton = ({user, onSuccess}: { user: UserRelationResponse, onSuccess: () => void }) => {
    const router = useRouter()
    const [isBlocked, setIsBlocked] = useState<boolean>(user.friendship.status == FriendshipStatus.BLOCKED)
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const HandleUnBlock = async () => {
        try {
            const res = await deleteFriendAction(user.id, FriendActionTypes.unblock)
            toast.success("Hủy chặn thành công")
            setIsBlocked(false)
            onSuccess()
        } catch (error) {
            toast.error((error as Error).message ?? "Lỗi không xác định")
        }
    }
    const HandleBlock = async () => {
        toast.warning("Bạn chắc chắn muốn chặn người dùng này?",
            {
                action: {
                    label: "Chặn",
                    onClick: async () => {
                        try {
                            const res = await postFriendAction(user.id, FriendActionTypes.block)
                            toast.success("Chặn thành công")
                            setIsBlocked(true)
                            onSuccess()
                        } catch (error) {
                            toast.error((error as Error).message ?? "Lỗi không xác định")
                        }
                    }
                }
            })
    }
    if (isBlocked) {
        return (
            <Button variant={"destructive"} className={"grow"} onClick={async () => {
                await HandleUnBlock()
            }}>
                Bỏ chặn
            </Button>
        )
    }
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button size={"icon"} variant={"outline"}>
                    <EllipsisVertical size={40}/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0 flex-col">
                <ConfirmDialog title={"Chặn người dùng"}
                               description={"Người dùng này sẽ không thể tìm thấy hay nhắn tin cho bạn. Chúng tôi sẽ không thông báo cho người dùng biết về việc bị chặn."}
                               onConfirm={async ()=>{
                                  await HandleBlock();
                                  setIsOpen(false)
                               }}>
                <Button className={"w-full !text-destructive"} variant={"ghost"} >
                    Chặn người dùng
                </Button>
                    </ConfirmDialog>
                <Button className={"w-full !text-destructive"} variant={"ghost"} onClick={async () => {
                }}>
                    Báo cáo người dùng
                </Button>
            </PopoverContent>
        </Popover>
    )
}