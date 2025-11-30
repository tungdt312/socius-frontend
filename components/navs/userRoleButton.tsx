import React from 'react'
import {useRole} from "@/components/RoleContext";
import {Check, Repeat, UserRound} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useCurrentUser} from "@/components/userContext";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ACCESS_TOKEN_KEY, ACTIVE_ROLE_KEY, REFRESH_TOKEN_KEY, USER_KEY, USER_ROLE_KEY} from "@/constants";
import {useRouter} from "next/navigation";

export const UserRoleButton = () => {
    const { activeRole, switchRole, availableRoles } = useRole();
    const user = useCurrentUser();
    //if (availableRoles.length <= 1) return null; // Nếu chỉ có 1 role thì ẩn đi
    const router = useRouter();
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="w-fit lg:w-full h-fit flex px-2 py-1 ">
                    <Avatar className={"size-8"}>
                        <AvatarImage src={user.avatarUrl} className={"object-cover"}/>
                        <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                    </Avatar>
                    <p className={"hidden lg:block line-clamp-1 overflow-ellipsis flex-1"}> {user.displayName} </p>
                    {availableRoles.length > 1 && <Repeat className={"hidden lg:block"} size={16}/>}

                </Button>
            </PopoverTrigger>
            <PopoverContent side={"top"} className={"w-fit flex flex-col p-0"}>
                {availableRoles.map((role) => (
                    <Button
                        key={role}
                        onClick={() => switchRole(role)}
                        className="w-full"
                        variant="ghost"
                    >
                        {role === "ADMIN" && "Trang Quản trị"}
                        {role === "MODERATOR" && "Trang Kiểm duyệt"}
                        {role === "USER" && "Trang cá nhân"}
                    </Button>
                ))}
                <Button
                    key={"logout"}
                    onClick={() => {
                        localStorage.removeItem(USER_KEY);
                        localStorage.removeItem(ACCESS_TOKEN_KEY);
                        localStorage.removeItem(REFRESH_TOKEN_KEY);
                        localStorage.removeItem(USER_ROLE_KEY);
                        localStorage.removeItem(ACTIVE_ROLE_KEY);
                        router.push("/sign-in")}}
                    className="w-full text-destructive"
                    variant="ghost"
                >
                    Đăng xuất
                </Button>
            </PopoverContent>

        </Popover>
    );
}
