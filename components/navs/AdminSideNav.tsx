"use client"
import React from 'react'
import {usePathname} from "next/navigation";
import {getFirstPath, getSecondPath} from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {adminNavItems, userNavItems} from "@/constants";
import {UserRoleButton} from "@/components/navs/userRoleButton";
import {UserCog} from "lucide-react";

const AdminSideNav = () => {
    const pathName = usePathname();
    const rootPath = getSecondPath(pathName);
    return (

        <div
            className={" h-screen bg-background border-r-1 border-border overflow-hidden hidden flex-col md:flex p-2 gap-2 transition-all md:w-fit lg:w-[250px]"}>
            <Link href="/admin" className={"flex flex-col justify-between items-center w-full gap-0"}>
                <Image alt={"logo"} src={'/Logo.svg'} height={100} width={100}
                       className="mb-4 size-11 block lg:hidden"/>
                <Image alt={"logo"} src={'/Logo-full.svg'} height={100} width={100}
                       className="mb-4 h-11 w-auto hidden lg:block"/>
                <p className={" flex mx-auto text-center subtitle1 px-2 py-1 rounded-full ring-2 ring-primary text-muted-foreground gap-1"}>
                    <UserCog className={"size-6"}/>
                    <span className={"hidden lg:block"}>Quản trị viên</span>
                </p>
            </Link>
            <ToggleGroup className={"flex-col w-full h-full justify-between"} type="single" spacing={4}
                         value={rootPath}>
                <div className={"flex-col flex w-full h-full"}>
                    {adminNavItems.map((navItem) => {
                        const Icon = navItem.icon
                        return <ToggleGroupItem asChild value={navItem.url} aria-label={navItem.name} size="lg"
                                                key={navItem.url}
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
export default AdminSideNav
