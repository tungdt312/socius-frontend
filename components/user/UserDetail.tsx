"use client"
import React, {useEffect, useState} from 'react'
import Image from "next/image";
import {UserListTag} from "@/components/user/UserList";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {BlockButton, FollowButton, FriendButton} from "@/components/Button";
import {MessageCircle, UserRound} from "lucide-react";
import {UserRelationResponse, UserResponse} from "@/types/dtos/user";
import {getUserAndStatusById} from "@/services/userService";
import {toast} from "sonner";
import {USER_KEY} from "@/constants";
import {FriendshipStatus} from "@/constants/enum";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {postConversation} from "@/services/messageService";
import {useRouter} from "next/navigation";

const UserDetail = ({userId}: { userId: string }) => {
    const router = useRouter();
    const [user, setUser] = useState<UserRelationResponse | null>(null);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [isBlocked, setIsBlocked] = useState<boolean>()
    const [isLoading, setIsLoading] = useState(true);

    const createMessage = async () => {
        try {
            const res = await postConversation({memberIds: [userId], isGroup: false});
            router.push(`/message/${res.id}`);
        } catch(error) {
            toast.error((error as Error).message ?? "Không thể tạo cuộc trò chuyện");
        }
    }
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserAndStatusById(userId);
                const ownerDataString = localStorage.getItem(USER_KEY);
                const owner: UserResponse | null = ownerDataString ? JSON.parse(ownerDataString) : null;

                const newIsOwner = (userId == owner?.id);
                const newIsBlocked = (data?.friendship?.status === FriendshipStatus.BLOCKED);

                setUser(data);
                setIsOwner(newIsOwner);
                setIsBlocked(newIsBlocked);
            } catch (error) {
                toast.error((error as Error).message ?? "Không thể lấy dữ liệu người dùng");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData()
    }, [userId]);
    if (isLoading) {
        return <div>Đang tải...</div>; // Trạng thái loading
    }
    if (!user) {
        return <div>Lỗi: Không tìm thấy người dùng.</div>; // Trạng thái lỗi
    }
    return (
        <>
            <div className="w-full h-fit flex items-center gap-4 ">
                <div className="w-1/3 h-full ">
                    <Avatar className={"max-w-30 aspect-square size-full mx-auto"}>
                        <AvatarImage src={user.avatarUrl} className={"object-cover"}/>
                        <AvatarFallback><UserRound size={"80%"}/></AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col items-start justify-center w-2/3 gap-2 ">
                    <p className={"heading2"}>{user.displayName}</p>
                    <div className="flex flex-col md:flex-row justify-start items-start md:gap-4">
                        <UserListTag userId={userId} type={"friends"}/>
                        <UserListTag userId={userId} type={"followers"}/>
                        <UserListTag userId={userId} type={"following"}/>
                    </div>
                    <p className={"body1"}>{user.bio}</p>
                </div>
            </div>
            {isOwner && <div className="flex items-center w-full gap-4">
                <Button className={"grow"} asChild>
                    <Link href={"/setting/profile"}>
                        Chỉnh sửa trang cá nhân
                    </Link>
                </Button>
            </div>}
            {!isOwner && (<div className="flex items-center justify-end w-full gap-4">
                {!isBlocked && (<>
                        <FriendButton user={user}/>
                        <FollowButton user={user}/>
                        <Button className={"grow"} onClick={createMessage}>
                                Nhắn tin
                                <MessageCircle/>
                        </Button>
                    </>)}
                <BlockButton user={user} onSuccess={() => {
                    setIsBlocked(!isBlocked)
                }} />
            </div>)}
        </>
    )
}
export default UserDetail
