"use client";

import {useCallback, useEffect, useRef, useState} from "react";
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
import {LoaderCircle, X} from "lucide-react";
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
import {useDebounce} from "@/hooks/use-rebounce";


export const UserListTag = ({userId, type}: { userId: string, type: UserListType }) => {
    const [page, setPage] = useState<Page<UserRelationResponse>>();
    const {label} = listMapper[type];
    const fetchUsers = async () => {
        try {
            let res: Page<UserRelationResponse>;
            switch (type) {
                case "friends":
                    res = await getFriendsList(undefined, userId, {page: 0, size:1});
                    break;
                case "following":
                case "followers":
                    res = await getFollowList(userId, type, {page: 0, size:1});
                    break;
                case "search":
                    res = await getUsersList({page: 0, size:1});
                    break;
                default:
                    res = await getFriendsList(type, userId, {page: 0, size:1});
            }
            setPage(res);
        } catch (err) {
            toast.error((err as Error).message ?? "Lấy danh sách người dùng thất bại");
        }
    }
    useEffect(() => {
        fetchUsers();
    }, [userId]);

    return (
        <AlertDialog>
            <AlertDialogTrigger className="cursor-pointer body2 hover:opacity-75 ">
                <b>{formatNumber(page?.totalElements ?? 0)}</b> {label}
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md w-full h-2/3 flex flex-col items-center gap-2">
                <AlertDialogHeader className="relative w-full">
                    <AlertDialogTitle
                        className="heading5 text-center w-full">{label} ({page?.totalElements ?? 0})</AlertDialogTitle>
                    <AlertDialogCancel className="size-fit !p-1 aspect-square absolute right-0 rounded-full">
                        <X/>
                    </AlertDialogCancel>
                </AlertDialogHeader>
                <Separator/>
                <UserList userId={userId} type={type}/>
            </AlertDialogContent>
        </AlertDialog>
    )
        ;
};
export const UserList = ({ userId, type }: { userId?: string, type: UserListType }) => {
    const router = useRouter();

    // States
    const [users, setUsers] = useState<UserRelationResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    // Search & Filter
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500); // Delay 500ms khi gõ

    const { label } = listMapper[type];

    // Intersection Observer Ref
    const observer = useRef<IntersectionObserver | null>(null);

    // Element cuối cùng để trigger load more
    const lastUserElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return; // Đang load thì không trigger

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                // Khi thấy phần tử cuối cùng -> Tăng page lên
                setCurrentPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    // Hàm gọi API trung gian để xử lý logic switch case gọn hơn
    const fetchByType = async (currentPage: number, searchTerm: string) => {
        let effectiveUserId = userId;

        // Logic lấy ID từ localStorage nếu thiếu
        if (!effectiveUserId && (type === "following" || type === "followers")) {
            if (typeof window !== "undefined") {
                const storedUser = localStorage.getItem(USER_KEY);
                if (storedUser) {
                    effectiveUserId = JSON.parse(storedUser).id;
                } else {
                    throw new Error("Không thể xác định người dùng.");
                }
            }
        }

        const page: PageRequest = {
            page: currentPage,
            size: 10, // Load 10 item mỗi lần
            filter: searchTerm ? `displayName=ilike='${searchTerm}'` : undefined // Gửi từ khóa tìm kiếm lên server
        };

        switch (type) {
            case "friends":
                // Đảm bảo getFriendsList nhận params
                return getFriendsList(undefined, userId, page);
            case "following":
            case "followers":
                return getFollowList(effectiveUserId, type, page);
            case "search":
                return getUsersList(page);
            default:
                return getFriendsList(page); // Default case
        }
    };

    // Effect 1: Reset khi thay đổi Type hoặc Search (Chạy lần đầu)
    useEffect(() => {
        setUsers([]);
        setCurrentPage(0);
        setHasMore(true);
        // Page 0 sẽ được trigger bởi Effect 2 bên dưới hoặc gọi trực tiếp ở đây
        // Tuy nhiên để tránh race condition, ta tách hàm fetch ra
        fetchData(0, debouncedSearch, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, userId, debouncedSearch]);

    // Effect 2: Load more khi Page thay đổi (trừ page 0 đã load ở trên)
    useEffect(() => {
        if (currentPage > 0) {
            fetchData(currentPage, debouncedSearch, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const fetchData = async (pageIndex: number, searchTerm: string, isReset: boolean) => {
        setIsLoading(true);
        setError(false);
        try {
            const res = await fetchByType(pageIndex, searchTerm);

            const newUsers = res.content || [];

            setUsers(prev => isReset ? newUsers : [...prev, ...newUsers]);

            // Logic check xem còn trang sau không
            // Cách 1: Check res.last
            setHasMore(!(res.numberOfElements < res.size));

            // Cách 2: Nếu API không trả về last, check số lượng
            // setHasMore(newUsers.length === 10);

        } catch (err) {
            toast.error((err as Error).message?? "Lấy danh sách thất bại");
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full flex-1 h-full">
            <Input
                className="flex w-full items-center gap-2"
                type="text"
                placeholder={`Tìm kiếm ${label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex flex-col items-center w-full flex-1 overflow-y-auto h-0 min-h-0 pr-1">
                {/* overflow-y-auto + h-0 + flex-1 là combo chuẩn để scroll nội bộ trong flex container */}

                <div className="flex flex-col items-center gap-2 w-full h-fit py-2">
                    {users.map((user, index) => {
                        // Logic chọn component hiển thị
                        const ItemComponent = (type === "followers" || type === "following")
                            ? FollowListItem
                            : FriendListItem;

                        // Nếu là phần tử cuối cùng, gắn ref vào để detect scroll
                        if (users.length === index + 1) {
                            return (
                                <div ref={lastUserElementRef} key={user.id} className="w-full">
                                    <ItemComponent user={user} />
                                </div>
                            );
                        }
                        return <ItemComponent user={user} key={user.id} />;
                    })}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="py-4">
                            {/* Hoặc spinner nhỏ nếu load more */}
                            {currentPage > 0 && <LoaderCircle className="animate-spin size-6 mx-auto mt-2 text-muted-foreground"/>}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && users.length === 0 && !error && (
                        <span className="text-center w-full text-muted-foreground mt-10">
                            Không tìm thấy {label.toLowerCase()} nào.
                        </span>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="flex flex-col gap-2 items-center mt-4">
                            <span className="text-red-500 text-sm">Có lỗi xảy ra</span>
                            <Button onClick={() => fetchData(currentPage, debouncedSearch, currentPage === 0)} variant="outline" size="sm">
                                Thử lại
                            </Button>
                        </div>
                    )}

                    {/* End of list indicator (Optional) */}
                    {!hasMore && users.length > 0 && (
                        <span className="text-xs text-muted-foreground py-4">Đã hiển thị hết danh sách</span>
                    )}
                </div>
            </div>
        </div>
    );
};