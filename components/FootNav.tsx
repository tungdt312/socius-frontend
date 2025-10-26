import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {userNavItems} from "@/constants";

const FootNav = ({user}: { user: any }) => {
    const [values, setValues] = React.useState("Trang chủ")

    return (
        <div
            className=" h-screen bg-background border-r-1 border-border hidden flex-col md:flex p-4 md:w-[78px] lg:w-[250px]">
            <Link href="/">
                <Image alt={"logo"} src={'/Logo.svg'} height={100} width={100}
                       className="mb-4 h-auto w-[200px] block lg:hidden "/>
                <Image alt={"logo"} src={'/Logo-full.svg'} height={100} width={100}
                       className="mb-4 h-auto w-[200px] hidden lg:block"/>
            </Link>
            <ToggleGroup className={"flex-col w-full h-full justify-between"} type="single" spacing={4} value={values}
                         onValueChange={(values) => {
                             if (values) setValues(values)
                         }}>
                <div className={"flex-col flex space-y-4 w-full"}>
                    {userNavItems.map((navItem) => {
                        const Icon = navItem.icon
                        return <Link href={navItem.url} className={"w-full h-fit"} key={navItem.name}>
                            <ToggleGroupItem value={navItem.name} aria-label={navItem.name} size={"lg"}
                                             className={"group transition-all w-fit h-fit lg:w-full justify-start items-center px-2 lg:px-4 py-2 text-foreground rounded-[8px] hover:bg-primary/30 data-[state=on]:bg-primary data-[state=on]:ring-1 data-[state=on]:ring-primary/50"}>

                                <Icon className="size-7 group-data-[state=on]:text-primary-foreground"/>
                                <p className={"subtitle1 hidden lg:block group-data-[state=on]:text-primary-foreground"}>{navItem.name}</p>

                            </ToggleGroupItem>
                        </Link>
                    })}
                </div>
                <Link href={`/user/${user?.id}`} className={"w-full h-fit"} key={user?.name}>
                    <ToggleGroupItem value={"Trang cá nhân"} aria-label={"Trang cá nhân"} size={"lg"}
                                     className={"group transition-all w-fit h-fit lg:w-full justify-start items-center px-2 lg:px-4 py-2 text-foreground rounded-[8px] hover:bg-primary/30 data-[state=on]:bg-primary data-[state=on]:ring-1 data-[state=on]:ring-primary/50"}>
                        <Image alt={"avatar"}
                               src={'https://tse2.mm.bing.net/th/id/OIP.Q6R49EFCR62g4QtakGPRFAHaHZ?rs=1&pid=ImgDetMain&o=7&rm=3'}
                               height={40} width={40}
                               className="size-7 rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"/>
                        <p className={"subtitle1 hidden lg:block group-data-[state=on]:text-primary-foreground overflow-ellipsis"}>Trang
                            cá nhân</p>

                    </ToggleGroupItem>
                </Link>
            </ToggleGroup>

        </div>
    )
}
export default FootNav
