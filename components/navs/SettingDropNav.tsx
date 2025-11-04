// components/navs/SettingDropNav.tsx
"use client"
import React from 'react'
import {userSettingNavItems} from "@/constants";
import {usePathname, useRouter} from "next/navigation";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

const SettingSideNav = () => {
    const router = useRouter();
    const pathName = usePathname();
    return (
        <Select value={pathName} onValueChange={(val: string) => router.push(val)}>
            <SelectTrigger className={"flex w-50 lg:hidden m-2"}>
                <SelectValue placeholder={"Cài đặt"}  />
            </SelectTrigger>
            <SelectContent className={"flex flex-col w-full"}>
                <SelectGroup className={"flex flex-col w-full"}>
                    <SelectLabel>Cài đặt</SelectLabel>
                    {userSettingNavItems.map((navItem) => {
                        const Icon = navItem.icon
                        return (
                            <SelectItem
                                value={navItem.url}
                                aria-label={navItem.name}
                                key={navItem.url}
                                className="w-full gap-2"
                            >
                                <div className="w-full gap-2 flex items-center">
                                    <Icon className="size-4"/>
                                    <p className="">
                                        {navItem.name}
                                    </p>
                                </div>
                            </SelectItem>
                        )
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
export default SettingSideNav
