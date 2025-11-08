"use client";

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {UserRelationResponse} from "@/types/dtos/user";
import {Separator} from "@/components/ui/separator";
import {X} from "lucide-react";
import {BASE, formatNumber} from "@/lib/utils";
import {FollowListItem, FriendListItem, UserListItemSkeleton} from "@/components/user/ListItem";
import {Page} from "@/types/dtos/base";
import {ScrollArea} from "@/components/ui/scroll-area";
import {listMapper, UserListType} from "@/constants/enum";
import {getFriendsList} from "@/services/friendService";
import {getFollowList, getUsersList} from "@/services/userService";
import {toast} from "sonner";
import {USER_KEY} from "@/constants";
import {router} from "next/client";
import {useRouter} from "next/navigation";


export const UserListTag = ({userId, type}: { userId: string, type: UserListType }) => {
    const [page, setPage] = useState<Page<UserRelationResponse>>();
    const {label} = listMapper[type];
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let res: Page<UserRelationResponse>;
                switch (type) {
                    case "friends":
                        res = await getFriendsList(undefined, userId)
                        break;
                    case "following":
                        res = await getFollowList(userId, type);
                        break;
                    case "followers":
                        res = await getFollowList(userId, type);
                        break;
                    case "search":
                        res = await getUsersList();
                        break;
                    default:
                        res = await getFriendsList(type);
                }
                setPage(res);
            } catch (err) {
                throw new Error((err as Error).message ?? "Lấy danh sách người dùng thất bại");
            }
        }
        fetchUsers();
    }, [userId]);

    return (
        <AlertDialog>
            <AlertDialogTrigger className="cursor-pointer body2 hover:opacity-75 ">
                <b>{formatNumber(page?.totalElements ?? 0)}</b> {label}
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md w-full flex flex-col items-center gap-2">
                <AlertDialogHeader className="relative w-full">
                    <AlertDialogTitle
                        className="heading5 text-center w-full">{label} ({page?.totalElements ?? 0})</AlertDialogTitle>
                    <AlertDialogCancel className="size-fit !p-1 aspect-square absolute right-0 rounded-full">
                        <X/>
                    </AlertDialogCancel>
                </AlertDialogHeader>
                <Separator/>
                <AlertDialogDescription className={"h-[450px] mt-2 w-full"}>
                    <UserList userId={userId} type={type}/>
                </AlertDialogDescription>
            </AlertDialogContent>
        </AlertDialog>
    )
        ;
};
export const UserList = ({userId, type}: {
    userId?: string,
    type: UserListType
}) => {
    const router = useRouter();
    const [users, setUsers] = useState<UserRelationResponse[]>([]);
    const [page, setPage] = useState<Page<UserRelationResponse>>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState("");
    const {label} = listMapper[type];
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(false);

            try {
                let effectiveUserId = userId;

                if (!effectiveUserId && (type === "following" || type === "followers")) {
                    const storedUser = localStorage.getItem(USER_KEY);
                    if (storedUser) {
                        effectiveUserId = JSON.parse(storedUser).id;
                    } else {
                        toast.error("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
                    }
                }

                let res: Page<UserRelationResponse>;
                switch (type) {
                    case "friends":
                        res = await getFriendsList(undefined, userId);
                        break;
                    case "following":
                    case "followers":
                        res = await getFollowList(effectiveUserId!, type);
                        break;
                    case "search":
                        res = await getUsersList();
                        break;
                    default:
                        res = await getFriendsList(type);
                }
                setPage(res);
                setUsers(users.concat(res.content ?? []));

            } catch (err) {
                toast.error((err as Error).message ?? "Lấy danh sách người dùng thất bại");
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [type, userId]);


    const filtered = users.filter((user) =>
        user.displayName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Input className="flex w-full items-center gap-2 mb-2"
                   type="text"
                   placeholder="Tìm kiếm"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-col items-center w-full h-[450px]">
                <div className={"flex flex-col items-center gap-2 w-full h-fit"}>
                    {error ? (
                        <>
                            <span>{error}</span>
                            <Button onClick={router.refresh} variant={"outline"} size={"sm"}>Thử lại</Button>
                        </>
                    ) : (
                        filtered.length > 0 ? (
                            filtered.map((user) => (
                                (type == "followers" || type == "following") ?
                                    <FollowListItem user={user} key={user.id}/> :
                                    <FriendListItem user={user} key={user.id}/>
                            ))
                        ) : (
                            <span className={"text-center w-full"}>Không có {label} nào</span>
                        )
                    )}
                </div>
                {isLoading && <UserListItemSkeleton/>}
            </div>
        </div>
    )
        ;
};
