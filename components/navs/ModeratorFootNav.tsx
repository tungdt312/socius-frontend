"use client"

import React from 'react'
import Link from "next/link";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {moderatorNavItems, userNavItems} from "@/constants";
import {usePathname, useRouter} from "next/navigation";
import {UserRoleButton} from "@/components/navs/userRoleButton";
import {getSecondPath} from "@/lib/utils";

export const ModeratorFootNav = () => {
    const router = useRouter();
    const pathName = usePathname();
    const rootPath = getSecondPath(pathName);
    return (
        <ToggleGroup className={`sticky bottom-0 h-auto w-full ${(pathName.startsWith("/message/") ? "hidden":"flex")} items-center justify-between bg-background rounded-none border-t-1 border-border px-4 py-1 md:hidden`} type="single" spacing={4} value={rootPath}>
            {moderatorNavItems.map((navItem) => {
                const Icon = navItem.icon
                return <ToggleGroupItem asChild value={navItem.url} aria-label={navItem.name} key={navItem.url} size={"lg"}
                                        className="group transition-all size-fit p-2  justify-center items-center text-foreground rounded-[8px] hover:bg-primary/30 data-[state=on]:bg-primary data-[state=on]:ring-1 data-[state=on]:ring-primary/50">
                    <Link href={navItem.url} title={navItem.name} >
                        <Icon className="size-7 group-data-[state=on]:text-primary-foreground" />
                    </Link>
                </ToggleGroupItem>
            })}
            <UserRoleButton/>
        </ToggleGroup>
    )
}