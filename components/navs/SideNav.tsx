"use client"
import React, {useEffect, useState} from 'react'
import Image from 'next/image'
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {USER_KEY, userNavItems} from "@/constants";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {UserResponse} from "@/types/dtos/user";
import {ScrollArea} from "@/components/ui/scroll-area";
const getFirstPath = (pathName?: string) => {
    if (!pathName) return "/";
    const parts = pathName.split("/").filter(Boolean);
    return parts.length === 0 ? "/" : `/${parts[0]}`;
};
const SideNav = () => {
    const router = useRouter();
    const pathName = usePathname();
    const rootPath = getFirstPath(pathName);
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

        <div
            className={" h-screen bg-background border-r-1 border-border overflow-hidden hidden flex-col md:flex p-2 transition-all md:w-fit lg:w-[250px]"}>
            <Link href="/">
                <Image alt={"logo"} src={'/Logo.svg'} height={100} width={100}
                       className="mb-4 size-auto block lg:hidden "/>
                <Image alt={"logo"} src={'/Logo-full.svg'} height={100} width={100}
                       className="mb-4 h-auto w-auto hidden lg:block"/>
            </Link>
            <ToggleGroup className={"flex-col w-full h-full justify-between"} type="single" spacing={4}
                         value={rootPath}>
                <div className={"flex-col flex w-full h-full"}>
                    {userNavItems.map((navItem) => {
                        const Icon = navItem.icon
                        const itemRoot = getFirstPath(navItem.url)
                        return <ToggleGroupItem asChild value={itemRoot} aria-label={navItem.name} size="lg" key={itemRoot}
                                                className="group transition-all mb-4 w-fit h-fit lg:w-full justify-start items-center px-2 lg:px-4 py-2 text-foreground rounded-[8px] hover:bg-primary/30 data-[state=on]:bg-primary data-[state=on]:ring-1 data-[state=on]:ring-primary/50">
                            <Link
                                href={navItem.url}
                                className="lg:w-full justify-start items-center w-fit">
                                <Icon className="size-7
                             group-data-[state=on]:text-primary-foreground"/>
                                <p className="hidden lg:block group-data-[state=on]:text-primary-foreground">
                                    {navItem.name}
                                </p>
                            </Link>
                        </ToggleGroupItem>
                    })}
                </div>
                <ToggleGroupItem asChild value="Trang cá nhân" aria-label="Trang cá nhân" size="lg"
                                 className="group transition-all w-fit h-fit lg:w-full justify-start items-center px-2 lg:px-4 py-2 text-foreground rounded-[8px] hover:bg-primary/30 data-[state=on]:bg-primary data-[state=on]:ring-1 data-[state=on]:ring-primary/50">
                    <Button
                        onClick={() => router.push(`/user/${user?.id}`)}
                        className="w-full justify-start items-center gap-2 size-fit"
                        size="lg"
                    >
                        <Image
                            alt="avatar"
                            src={user.avatarUrl|| process.env.NEXT_PUBLIC_AVATAR_URL!}
                            height={40}
                            width={40}
                            className="size-7 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                        />
                        <p className="subtitle1 hidden lg:block group-data-[state=on]:text-primary-foreground overflow-ellipsis">
                            Trang cá nhân
                        </p>
                    </Button>
                </ToggleGroupItem>
            </ToggleGroup>
        </div>


    )
}
export default SideNav
