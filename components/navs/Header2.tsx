"use client"
import React, {useEffect, useState} from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Bell, House, PlusSquare, UserRound} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";
import {UserResponse} from "@/types/dtos/user";
import {USER_KEY} from "@/constants";
import PostForm from "@/components/user/PostForm";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

const Header2 = () => {
    const router = useRouter();
    const pathName = usePathname();
    const [user, setUser] = useState<UserResponse | null>(null);

    useEffect(() => {
        const data = localStorage.getItem(USER_KEY)
        if (data) {
            setUser(JSON.parse(data));
        } else {
            if (pathName !== "/sign-in") {
                router.push("/sign-in");
            }
        }
    }, [router, pathName])

    if (!user) {
        return null;
    }
    if (pathName.toLowerCase()==="/"
        ||  pathName.toLowerCase().startsWith("/explore")
        || pathName.toLowerCase().startsWith("/user")
        || pathName.toLowerCase().startsWith("/friend")
        || pathName.toLowerCase().startsWith("/post"))
    return (
        <div
            className={"sticky z-10 top-0 h-auto w-full items-center justify-end bg-background rounded-none px-4 py-1 hidden md:flex"}>
            <div className="flex items-center h-auto w-auto space-x-4">
                <PostForm onPostCreated={()=>{}}>
                    <Button
                        variant="link"
                        title={"Tạo"}
                        className="w-full justify-start items-center gap-2 size-fit !p-1 text-foreground">
                        <PlusSquare className="size-7 "/>
                    </Button>
                </PostForm>
                <Button
                    variant="link"
                    title={"Thông báo"}
                    onClick={() => router.push("/notification")}
                    className="w-full justify-start items-center gap-2 size-fit !p-1 text-foreground">
                    <Bell className="size-7 "/>
                </Button>
                <Link href={`/user/${user?.id}`} title={"Trang cá nhân"} className="flex items-center h-auto w-auto space-x-4">
                    <Avatar className={"size-8"}>
                        <AvatarImage src={user.avatarUrl} className={"object-cover"}/>
                        <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                    </Avatar>
                    <p className="subtitle1 text-foreground ">
                        {user.displayName}
                    </p>
                </Link>
            </div>
        </div>
    )
}
export default Header2
