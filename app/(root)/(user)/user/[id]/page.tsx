import React from 'react'
import {UserRelationResponse, UserResponse} from "@/types/apis/user";
import {BASE, parseStringify} from "@/lib/utils";
import Image from "next/image";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {notFound} from "next/navigation";
import Link from "next/link";
import {UserListTag} from "@/components/user/UserList";
import {globalState} from "@/lib/token";
import {MessageCircle} from "lucide-react";
import {FollowButton, FriendButton} from "@/components/Button";

interface PageProps {
    params: { id: string };
}

const Page = async ({params}: PageProps) => {
    const userId = (await params).id;
    const isOwner: boolean = userId == (globalState.owner?.id ?? "");
    let user: UserRelationResponse
    try {
        const res = await fetch(`${BASE}/api/users/${userId}/relation-status`, {
            method: "GET",
            cache: "no-cache",
        });
        if (!res.ok) notFound()
        const data  = await res.json();
        user = parseStringify(data);
    } catch(error){
        throw new Error("Get user relation failed");
    }    return (
        <div
            className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] min-h-full h-fit p-4 text-foreground"}>
            <div className="w-full h-fit flex items-center gap-4 ">
                <div className="w-1/3 h-full ">
                    <Image src={user.avatarUrl ?? process.env.NEXT_PUBLIC_AVATAR_URL} alt={user.displayName}
                           width={120} height={120} className={"w-full aspect-square rounded-full max-w-30  mx-auto"}/>
                </div>
                <div className="flex flex-col items-start justify-center w-2/3 gap-2 ">
                    <p className={"heading2"}>{user.displayName}</p>
                    <div className="flex flex-col md:flex-row justify-start items-start md:gap-4">
                        <UserListTag userId={userId} type={"Friends"}/>
                        <UserListTag userId={userId} type={"Followers"}/>
                        <UserListTag userId={userId} type={"Followings"}/>
                    </div>
                    <p className={"body1"}>{user.bio}</p>
                </div>
            </div>
            <div className="flex items-center w-full gap-4">
                {isOwner ? (
                        <Button className={"grow"} asChild>
                            <Link href={"/setting/profile"}>
                                Chỉnh sửa trang cá nhân
                            </Link>
                        </Button>) :
                    (
                        <>
                            <FriendButton user={user}/>
                            <FollowButton user={user}/>
                            <Button className={"grow"} asChild>
                                <Link href={"/message"}>
                                    Nhắn tin
                                    <MessageCircle/>
                                </Link>
                            </Button>
                        </>
                    )
                }
            </div>
            <Separator/>
        </div>
    )
}
export default Page
