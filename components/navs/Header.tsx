"use client"
import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Bell, House, PlusSquare, UserCog, UserLock} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";
import PostForm from "@/components/user/PostForm";
import {useRole} from "@/components/RoleContext";

const Header = () => {
    const router = useRouter();
    const pathName = usePathname();
    const {activeRole} = useRole();
    return (
        <div
            className={`sticky top-0 h-auto w-full ${(pathName.startsWith("/message/") ? "hidden":"flex")} items-center justify-between bg-background rounded-none border-b-1 border-border px-4 py-1 md:hidden `}>
            <Link href="/">
                <Image alt={"logo"} src={'/Logo-full.svg'} height={100} width={100}
                       className="h-8 w-auto"/>
            </Link>
            <div className="flex items-center h-auto w-auto space-x-4">
                {activeRole == "USER" && <PostForm onPostCreated={() => {
                }}>
                    <Button
                        variant="link"
                        title={"Tạo"}
                        className="w-full justify-start items-center gap-2 size-fit !p-1 text-foreground">
                        <PlusSquare className="size-7 "/>
                    </Button>
                </PostForm>}
                {activeRole == "USER" &&  <Button
                    variant="link"
                    title={"Thông báo"}
                    onClick={() => router.push("/notification")}
                    className="w-full justify-start items-center gap-2 size-fit !p-1 text-foreground">
                    <Bell className="size-7 "/>
                </Button>}
                {activeRole == "ADMIN" && <p className={"flex mx-auto text-center subtitle1 px-2 py-1 rounded-full ring-2  ring-primary text-muted-foreground gap-1"}>
                    <UserCog className={"size-6"}/>
                    <span className={"hidden md:block"}>Quản trị viên</span>
                </p>}
                {activeRole == "MODERATOR" && <p className={"flex mx-auto text-center subtitle1 px-2 py-1 rounded-full ring-2  ring-primary text-muted-foreground gap-1"}>
                    <UserLock className={"size-6"}/>
                    <span className={"hidden md:block"}>Kiểm duyệt viên</span>
                </p>}
            </div>
        </div>
    )
}
export default Header
