import {UserRelationResponse, UserResponse} from "@/types/dtos/user";
import Link from "next/link";
import {Item, ItemActions, ItemContent, ItemMedia, ItemTitle} from "@/components/ui/item";
import {UserRound} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import React, {useEffect, useState} from "react";
import {FriendActionTypes, FriendshipStatus} from "@/constants/enum";
import {follow, unfollow} from "@/services/userService";
import {deleteFriendAction, postFriendAction} from "@/services/friendService";
import {USER_KEY} from "@/constants";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export const UserListItemSkeleton = () => {
    return <Item className="w-full flex-row items-center justify-between">
        <ItemMedia>
            <Skeleton
                className="size-11 rounded-full mx-auto"
            />
        </ItemMedia>
        <ItemContent className="flex-row item-center justify-between w-full">
            <ItemTitle>
                <Skeleton className={"rounded-full w-30 h-5"}/>
            </ItemTitle>
        </ItemContent>
    </Item>
}

export const FollowListItem = ({ user }: { user: UserRelationResponse }) => {
    // 2. Dùng state cục bộ để UI phản hồi ngay lập tức
    const [isFollowing, setIsFollowing] = useState(user.following);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelf, setIsSelf] = useState(false);

    useEffect(() => {
        const ownerDataString = localStorage.getItem(USER_KEY);
        const ownerData: UserResponse | null = ownerDataString ? JSON.parse(ownerDataString) : null;

        if (ownerData?.id == user.id) setIsSelf(true);
    }, []);
    const FollowHandle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);

        const action = isFollowing ? "unfollow" : "follow";

        try {
            isFollowing ? await follow(user.id): unfollow(user.id);
            setIsFollowing(!isFollowing);
            toast.success(isFollowing ? "Hủy theo dõi thành công" : "Theo dõi thành công");
        } catch (error) {
            toast.error(isFollowing ? "Hủy theo dõi thất bại" : "Theo dõi thất bại");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Link href={`/user/${user.id}`} className="w-full flex-row items-center justify-between">
            <Item>
                <ItemMedia>
                    <Avatar className={"size-8"}>
                        <AvatarImage src={user.avatarUrl} className={"object-cover"}/>
                        <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent className="flex-row items-center justify-between w-full">
                    <ItemTitle>
                        <p className={"truncate max-w-60"}>{user.displayName}</p>
                    </ItemTitle>
                    <ItemActions>
                        {!isSelf && <Button size={"sm"} onClick={FollowHandle} disabled={isLoading}>
                            {isFollowing ? "Hủy theo dõi" : "Theo dõi"}
                        </Button>}
                    </ItemActions>
                </ItemContent>
            </Item>
        </Link>
    );
}

export const FriendListItem = ({ user }: { user: UserRelationResponse }) => {
    console.log(user);
    const [type, setType] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const initialType = (() => {
            const ownerDataString = localStorage.getItem(USER_KEY);
            const ownerData: UserResponse | null = ownerDataString ? JSON.parse(ownerDataString) : null;
            const status = user.friendship?.status;

            if (ownerData?.id == user.id) return ""
            if (!status) return FriendActionTypes.send;
            if (status === FriendshipStatus.PENDING) {
                return user.friendship.senderId === ownerData?.id ? FriendActionTypes.unsend : FriendActionTypes.accept;
            }
            if (status === FriendshipStatus.FRIEND) return "FRIEND";
            if (status === FriendshipStatus.BLOCKED) return FriendActionTypes.unblock;
            return FriendActionTypes.send;
        })();
        setType(initialType);
    },[])
    const HandleAction = async (e: React.MouseEvent, actionType: FriendActionTypes) => {
        // 2. NGĂN CHẶN LINK ĐIỀU HƯỚNG
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);

        const isDeleteAction = [FriendActionTypes.unblock, FriendActionTypes.unfriend].includes(actionType);
        const action = isDeleteAction ? deleteFriendAction : postFriendAction;

        try {
            await action(user.id, actionType);

            switch (actionType) {
                case FriendActionTypes.send:
                    setType(FriendActionTypes.unsend);
                    break;
                case FriendActionTypes.unsend:
                case FriendActionTypes.reject:
                case FriendActionTypes.unfriend:
                    setType(FriendActionTypes.send);
                    break;
                case FriendActionTypes.accept:
                    setType(FriendActionTypes.unfriend);
                    break;
                default:
                    setType(FriendActionTypes.send);
            }
        } catch (error) {
            toast.error("Thao tác thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    const getActionLabel = (actionType: string) => {
        const labels = {
            [FriendActionTypes.send]: "Gửi lời mời",
            [FriendActionTypes.unsend]: "Hủy lời mời",
            [FriendActionTypes.accept]: "Chấp nhận",
            [FriendActionTypes.reject]: "Từ chối",
            [FriendActionTypes.unfriend]: "Hủy kết bạn",
            [FriendActionTypes.block]: "Chặn",
            [FriendActionTypes.unblock]: "Bỏ chặn",
        };
        return labels[actionType as FriendActionTypes] ?? "Thao tác";
    };

    return (
        <Link href={`/user/${user.id}`} className="w-full flex-row items-center justify-between">
            <Item >
                <ItemMedia>
                    <Avatar className={"size-8"}>
                        <AvatarImage src={user.avatarUrl} className={"object-cover"}/>
                        <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent className="flex-row items-center justify-between flex-1">
                    <ItemTitle className={"flex-1 overflow-ellipsis line-clamp-1"}>{user.displayName}
                    </ItemTitle>

                    {type.length !== 0 && user.friendship?.status !== FriendshipStatus.FRIEND &&
                        <ItemActions>
                            <Button
                                size={"sm"}
                                variant={(type === FriendActionTypes.unblock) ? "destructive" : "default"}
                                onClick={(e) => HandleAction(e, type as FriendActionTypes)}
                                disabled={isLoading}
                            >
                                {getActionLabel(type as FriendActionTypes)}
                            </Button>
                            {type == FriendActionTypes.accept &&
                                <Button
                                    size={"sm"}
                                    variant={"secondary"}
                                    onClick={(e) => HandleAction(e, FriendActionTypes.reject)}
                                    disabled={isLoading}
                                >
                                    {getActionLabel(FriendActionTypes.reject)}
                                </Button>}
                        </ItemActions>
                    }
                </ItemContent>
            </Item>
        </Link>
    );
}