"use client"
import React from 'react'
import {usePathname} from "next/navigation";
import {getFirstPath} from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {userNavItems} from "@/constants";
import {UserRoleButton} from "@/components/navs/userRoleButton";

const UserSideNav = () => {
    const pathName = usePathname();
    const rootPath = getFirstPath(pathName);
    return (

        <div
            className={" h-screen bg-background border-r-1 border-border overflow-hidden hidden flex-col md:flex p-2 transition-all md:w-fit lg:w-[250px]"}>
            <Link href="/">
                <Image alt={"logo"} src={'/Logo.svg'} height={100} width={100}
                       className="mb-4 size-11 block lg:hidden "/>
                <Image alt={"logo"} src={'/Logo-full.svg'} height={100} width={100}
                       className="mb-4 h-11 w-auto hidden lg:block"/>
            </Link>
            <ToggleGroup className={"flex-col w-full h-full justify-between"} type="single" spacing={4}
                         value={rootPath}>
                <div className={"flex-col flex w-full h-full"}>
                    {userNavItems.map((navItem) => {
                        const Icon = navItem.icon
                        const itemRoot = getFirstPath(navItem.url)
                        return <ToggleGroupItem asChild value={itemRoot} aria-label={navItem.name} size="lg"
                                                key={itemRoot}
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
                <UserRoleButton/>
            </ToggleGroup>
        </div>
    )
}
export default UserSideNav
