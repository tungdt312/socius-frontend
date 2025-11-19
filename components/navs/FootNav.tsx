"use client"
// 1. Import thêm useState
import React, {useEffect, useState} from 'react'
import Link from "next/link";
import Image from "next/image";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {USER_KEY, userNavItems} from "@/constants";
// import {House, MessageCircle, PlusSquare, Search} from "lucide-react"; // (Bạn không dùng nên có thể xóa)
// import {Button} from "@/components/ui/button"; // (Bạn không dùng nên có thể xóa)
import {usePathname, useRouter} from "next/navigation";
import {UserResponse} from "@/types/dtos/user";

const FootNav = () => {
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
    return (
        <ToggleGroup className={`sticky bottom-0 h-auto w-full ${(pathName.startsWith("/message/") ? "hidden":"flex")} items-center justify-between bg-background rounded-none border-t-1 border-border px-4 py-1 md:hidden`} type="single" spacing={4} value={pathName}>
            {userNavItems.map((navItem) => {
                const Icon = navItem.icon
                return <ToggleGroupItem asChild value={navItem.url} aria-label={navItem.name} key={navItem.url} size={"lg"}
                                        className="group transition-all size-fit p-2  justify-center items-center text-foreground rounded-[8px] hover:bg-primary/30 data-[state=on]:bg-primary data-[state=on]:ring-1 data-[state=on]:ring-primary/50">
                    <Link href={navItem.url} title={navItem.name} >
                        <Icon className="size-7 group-data-[state=on]:text-primary-foreground" />
                    </Link>
                </ToggleGroupItem>
            })}
            <Link href={`/user/${user.id}`} title={"Trang cá nhân"}>
                <Image
                    alt="avatar"
                    src={user.avatarUrl || process.env.NEXT_PUBLIC_AVATAR_URL!}
                    height={40}
                    width={40}
                    className="size-7 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                />
            </Link>
        </ToggleGroup>
    )
}
export default FootNav