"use client"
import React from 'react'
import Image from 'next/image'
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {userNavItems, userSettingNavItems} from "@/constants";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {UserResponse} from "@/types/dtos/user";
import {ScrollArea} from "@/components/ui/scroll-area";
import {LogOut} from "lucide-react";
import {clearToken, globalState} from "@/lib/token";

const SettingSideNav = () => {
    const router = useRouter();
    const pathName = usePathname();

    return (
        <div
            className={"h-screen bg-background border-r-1 border-border overflow-hidden hidden flex-col lg:flex p-4 transition-all md:w-[78px] lg:w-[275px]"}>
            <p className={"heading5 mb-4"}>Cài đặt</p>
            <ToggleGroup className={"flex-col w-full h-full justify-between"} type="single" spacing={4}
                         value={pathName}>
                <div className={"flex-col flex w-full h-full overflow-auto"}>
                    {userSettingNavItems.map((navItem) => {
                        const Icon = navItem.icon
                        return <ToggleGroupItem asChild value={navItem.url} aria-label={navItem.name} key={navItem.url}
                                                className="group transition-all mb-4 w-fit h-fit lg:w-full justify-start items-center px-2 lg:px-4 py-2 text-foreground rounded-[8px] hover:bg-primary/30 data-[state=on]:bg-primary data-[state=on]:ring-1 data-[state=on]:ring-primary/50">
                            <Link
                                href={navItem.url}
                                className="w-full justify-start items-center gap-2">
                                <Icon className="size-5
                             group-data-[state=on]:text-primary-foreground"/>
                                <p className=" hidden lg:block group-data-[state=on]:text-primary-foreground">
                                    {navItem.name}
                                </p>
                            </Link>
                        </ToggleGroupItem>
                    })}
                </div>
                <Button
                    onClick={() => {
                        clearToken()
                        router.push("/sign-in")
                    }}
                    className="gap-2 size-fit h-fit lg:w-full justify-start items-center px-2 lg:px-4 py-2 text-primary-foreground rounded-[8px] bg-destructive hover:bg-destructive/30"
                >
                    <LogOut className="size-5"/>
                    <p className=" hidden lg:block ">
                        Đăng xuất
                    </p>
                </Button>
            </ToggleGroup>
        </div>
    )
}
export default SettingSideNav
