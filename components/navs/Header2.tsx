"use client"
import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Bell, House, PlusSquare} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";
import {UserResponse} from "@/types/apis/user";

const Header2 = ({user}: { user: UserResponse }) => {
    const router = useRouter();
    const pathName = usePathname();
    if (pathName.toLowerCase()==="/" ||  pathName.toLowerCase().startsWith("/explore")|| pathName.toLowerCase().startsWith("/user") || pathName.toLowerCase().startsWith("/friend"))
    return (
        <div
            className={"sticky z-10 top-0 h-auto w-full items-center justify-end bg-background rounded-none px-4 py-1 hidden md:flex"}>
            <div className="flex items-center h-auto w-auto space-x-4">
                <Button
                    variant="link"
                    title={"Tạo"}
                    onClick={() => {
                    }}
                    className="w-full justify-start items-center gap-2 size-fit !p-1 text-foreground">
                    <PlusSquare className="size-7 "/>
                </Button>
                <Button
                    variant="link"
                    title={"Thông báo"}
                    onClick={() => router.push("/notification")}
                    className="w-full justify-start items-center gap-2 size-fit !p-1 text-foreground">
                    <Bell className="size-7 "/>
                </Button>
                <Link href={`/user/${user?.id}`} title={"Trang cá nhân"} className="flex items-center h-auto w-auto space-x-4">
                    <Image
                        alt="avatar"
                        src={user.avatarUrl ?? process.env.NEXT_PUBLIC_AVATAR_URL}
                        height={40}
                        width={40}
                        className="size-7 rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                    />
                    <p className="subtitle1 text-foreground ">
                        {user.displayName}
                    </p>
                </Link>
            </div>
        </div>
    )
}
export default Header2
