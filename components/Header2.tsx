"use client"
import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Bell, House, PlusSquare} from "lucide-react";
import {useRouter} from "next/navigation";

const Header2 = ({user}: { user: any }) => {
    const router = useRouter();
    return (
        <div
            className={"sticky top-0 h-auto w-full items-center justify-end bg-accent rounded-none px-4 py-1 hidden md:flex"}>
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
                <Link href={`/user/${user?.id}`} title={"Trang cá nhân"}>
                    <Image
                        alt="avatar"
                        src="https://tse2.mm.bing.net/th/id/OIP.Q6R49EFCR62g4QtakGPRFAHaHZ?rs=1&pid=ImgDetMain&o=7&rm=3"
                        height={40}
                        width={40}
                        className="size-7 rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                    />
                </Link>
            </div>
        </div>
    )
}
export default Header2
