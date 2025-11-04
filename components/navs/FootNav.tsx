"use client"
import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {userNavItems} from "@/constants";
import {House, MessageCircle, PlusSquare, Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {usePathname, useRouter} from "next/navigation";
import {UserResponse} from "@/types/apis/user";

const FootNav = ({user}: { user: UserResponse }) => {
    const router = useRouter();
    const pathName = usePathname();

    return (
        <ToggleGroup className={"sticky bottom-0 h-auto w-full flex items-center justify-between bg-background rounded-none border-t-1 border-border px-4 py-1 md:hidden"} type="single" spacing={4} value={pathName}>
            {userNavItems.map((navItem) => {
                const Icon = navItem.icon
                return <ToggleGroupItem asChild value={navItem.url} aria-label={navItem.name} key={navItem.url} size={"lg"}
                                        className="group transition-all size-fit p-2  justify-center items-center text-foreground rounded-[8px] hover:bg-primary/30 data-[state=on]:bg-primary data-[state=on]:ring-1 data-[state=on]:ring-primary/50">
                    <Link href={navItem.url} title={navItem.name} >
                        <Icon className="size-7 group-data-[state=on]:text-primary-foreground" />
                    </Link>
                </ToggleGroupItem>
            })}
            <Link href={`/user/${user?.id}`} title={"Trang cá nhân"}>
                <Image
                    alt="avatar"
                    src={user.avatarUrl ?? process.env.NEXT_PUBLIC_AVATAR_URL}
                    height={40}
                    width={40}
                    className="size-7 rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                />
            </Link>
        </ToggleGroup>
    )
}
export default FootNav
