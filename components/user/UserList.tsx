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
import {UserRelationResponse} from "@/types/apis/user";
import {Separator} from "@/components/ui/separator";
import {X} from "lucide-react";
import {BASE, formatNumber} from "@/lib/utils";
import {FollowListItem, FriendListItem, UserListItemSkeleton} from "@/components/user/ListItem";
import {Page} from "@/types/apis/base";
import {ScrollArea} from "@/components/ui/scroll-area";

type UserListType = "Friends" | "Followers" | "Followings" | "Blockeds" | "None" | "Sent" | "Pending";
const listMapper: Record<UserListType, { endpoint: string; label: string }> = {
    Friends: {
        endpoint: "",
        label: "Bạn bè",
    },
    Followers: {
        endpoint: "/followers",
        label: "Người theo dõi",
    },
    Followings: {
        endpoint: "/followings",
        label: "Đang theo dõi",
    },
    Blockeds: {
        endpoint: "blocked",
        label: "Đã chặn",
    },
    Sent: {
        endpoint: "sent",
        label: "Lời mời đã gửi",
    },
    Pending: {
        endpoint: "pending",
        label: "Lời mời kết bạn",
    },
    None: {
        endpoint: "search",
        label: "Người dùng",
    }
};
export const UserListTag = ({userId, type}: { userId: string, type: UserListType }) => {
    const [page, setPage] = useState<Page<UserRelationResponse>>();
    const {endpoint, label} = listMapper[type];
    const baseEndpoint = ["Blockeds", "Friends"].includes(type) ? "friends" : "users"
    const Endpoint = `${BASE}/api/${baseEndpoint}/${userId}${endpoint}`
    const fetchUsers = async () => {
        try {
            const res = await fetch(Endpoint, {
                method: "GET",
            });
            const data: Page<UserRelationResponse> = await res.json();
            setPage(data);
        } catch (err) {
            throw new Error("GetUser");
        }
    };
    useEffect(() => {
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
                <AlertDialogDescription className={"h-[450px] w-full"}>
                    <Separator/>
                    <UserList userId={userId} type={type}/>
                </AlertDialogDescription>
            </AlertDialogContent>
        </AlertDialog>
    )
        ;
};
export const UserList = ({userId, type}: {
    userId: string,
    type: UserListType
}) => {
    const [users, setUsers] = useState<UserRelationResponse[]>([]);
    const [page, setPage] = useState<Page<UserRelationResponse>>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const {endpoint, label} = listMapper[type];
    const baseEndpoint = (type === "None")? 'users/search' :(["Blockeds", "Friends","Sent","Pending"].includes(type) ? `friends?type=${endpoint}` : `users/${userId}/${endpoint}`)
    const Endpoint = `${BASE}/api/${baseEndpoint}`

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(Endpoint, {
                method: "GET",
                cache: "no-cache"
            });
            if (!res.ok) {
                setError(`Không thể tải danh sách ${label}`);
                return
            }
            const data: Page<UserRelationResponse> = await res.json();
            setUsers(data.content)
            setPage(data)
            console.log(data)
        } catch (err) {
            throw new Error("getUser");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [userId]);

    const filtered = users.filter((user) =>
        user.displayName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="flex w-full items-center gap-2 mb-2">
                <Input
                    type="text"
                    placeholder="Tìm kiếm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <ScrollArea className="flex flex-col items-center w-full h-[450px] overflow-hidden">
                <div className={"flex flex-col items-center gap-2 w-full h-fit"}>
                {error ? (
                    <>
                        <p>{error}</p>
                        <Button onClick={fetchUsers} variant={"outline"}>Thử lại</Button>
                    </>
                ) : (
                    <>
                        {filtered.length > 0 ? (
                            filtered.map((user) => (
                                (type == "Followers" || type == "Followings")?
                                    <FollowListItem user={user} key={user.id}/>    :
                                <FriendListItem user={user} key={user.id}/>
                            ))
                        ) : (
                            <>
                                <p className={"text-center w-full"}>Không có {label} nào</p>
                            </>
                        )}
                    </>
                )}
                {isLoading && <UserListItemSkeleton/>}
                </div>
            </ScrollArea>
        </>
    )
        ;
};
