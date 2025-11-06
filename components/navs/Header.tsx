"use client"
import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Bell, House, PlusSquare} from "lucide-react";
import {useRouter} from "next/navigation";
import PostForm from "@/components/user/PostForm";

const Header = () => {
    const router = useRouter();
    return (
        <div
            className={"sticky top-0 h-auto w-full flex items-center justify-between bg-background rounded-none border-b-1 border-border px-4 py-1 md:hidden"}>
            <Link href="/">
                <Image alt={"logo"} src={'/Logo-full.svg'} height={100} width={100}
                       className="h-11 w-auto"/>
            </Link>
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
            </div>
        </div>
    )
}
export default Header
