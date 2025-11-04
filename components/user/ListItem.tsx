import {UserRelationResponse} from "@/types/dtos/user";
import Link from "next/link";
import {Item, ItemActions, ItemContent, ItemMedia, ItemTitle} from "@/components/ui/item";
import Image from "next/image";
import {Dot} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {globalState} from "@/lib/token";
import {useState} from "react";
import {FriendActionTypes, FriendshipStatus} from "@/constants/enum";

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

/*export const FriendListItem = ({user}: { user: UserRelationResponse }) => {
    return (
        <Link href={`/user/${user.id}`} className="w-full flex-row items-center justify-between">
            <Item >
                <ItemMedia>
                    <Image
                        src={user.avatarUrl ?? process.env.NEXT_PUBLIC_AVATAR_URL!}
                        alt={user.displayName}
                        width={44}
                        height={44}
                        className="size-full rounded-full max-w-11 mx-auto"
                        loading={"lazy"}
                    />
                </ItemMedia>
                <ItemContent className="flex-row items-center justify-between w-full">
                    <ItemTitle>
                        <p className={"truncate max-w-60"}>{user.displayName}</p>
                    </ItemTitle>
                    <Dot className={user.isActive ? "text-success size-10" : "text-muted-foreground  size-10"}/>
                </ItemContent>
            </Item>
        </Link>
    );
};*/

export const FollowListItem = ({user}: { user: UserRelationResponse }) => {
    const FollowHandle = async (isFollowing: boolean) => {
        try {
            const res = await fetch(`api/users/follow?targetId=${user.id}`, {
                method: (isFollowing) ? "DELETE" : "POST",
            })
            if (!res.ok) {
                toast.error((isFollowing) ? "Hủy theo dõi thất bại" : "Theo dõi thất bại")
            }
        } catch (error) {
            throw new Error("Follow failed");
        }
    }
    return (
        <Link href={`/user/${user.id}`} className="w-full flex-row items-center justify-between">
            <Item>
                <ItemMedia>
                    <Image
                        src={user.avatarUrl ?? process.env.NEXT_PUBLIC_AVATAR_URL!}
                        alt={user.displayName}
                        width={44}
                        height={44}
                        className="size-full rounded-full max-w-11 mx-auto"
                        loading={"lazy"}
                    />
                </ItemMedia>
                <ItemContent className="flex-row items-center justify-between w-full">
                    <ItemTitle>
                        <p className={"truncate max-w-60"}>{user.displayName}</p>
                    </ItemTitle>
                    <ItemActions>
                        <Button size={"sm"} onClick={()=>FollowHandle(user.following)}>
                            {(user.following) ? "Hủy theo dõi" : "Theo dõi"}
                        </Button>
                    </ItemActions>
                </ItemContent>
            </Item>
        </Link>
    );
}
export const FriendListItem = ({user}: { user: UserRelationResponse }) => {
    const currentUserId = globalState.owner?.id;
    const initialType = (() => {
        const status = user.friendship?.status;
        if (!status) return "";
        if (status === FriendshipStatus.PENDING) {
            return user.friendship.senderId === currentUserId ? FriendActionTypes.unsend : FriendActionTypes.accept;
        }
        if (status === FriendshipStatus.FRIEND) return "";
        if (status === FriendshipStatus.BLOCKED) return FriendActionTypes.unblock;
        return FriendActionTypes.send;
    })();
    const [type, setType] = useState(initialType);
    const HandleAction = async (type: FriendActionTypes) => {
        try {
            const res = await fetch(`api/friends?type=${type}&&targetId=${user.id}`, {
                method: [FriendActionTypes.unblock, FriendActionTypes.unfriend].includes(type as FriendActionTypes)
                    ? "DELETE" : "POST",
            })
            if (!res.ok) {
                toast.error("Thao tác thất bại")
                return
            }
            switch (type) {
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
            throw new Error("Action failed")
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
            <Item>
                <ItemMedia>
                    <Image
                        src={user.avatarUrl ?? process.env.NEXT_PUBLIC_AVATAR_URL!}
                        alt={user.displayName}
                        width={44}
                        height={44}
                        className="size-full rounded-full max-w-11 mx-auto"
                        loading={"lazy"}
                    />
                </ItemMedia>
                <ItemContent className="flex-row items-center justify-between w-full">
                    <ItemTitle>
                        <p className={"truncate max-w-60"}>{user.displayName}</p>
                    </ItemTitle>
                    {type.length === 0 ? (
                            <Dot className={user.isActive ? "text-success size-10" : "text-muted-foreground  size-10"}/>) :
                        <ItemActions>
                            <Button size={"sm"} variant={(type === FriendActionTypes.unblock) ? "destructive": "default"} onClick={() => HandleAction(type as FriendActionTypes)}>
                                {getActionLabel(type as FriendActionTypes)}
                            </Button>
                            {type == FriendActionTypes.accept &&
                                <Button size={"sm"}  variant={"secondary"} onClick={() => HandleAction(FriendActionTypes.reject)}>
                                    {getActionLabel(FriendActionTypes.reject)}
                                </Button>}
                        </ItemActions>
                    }
                </ItemContent>
            </Item>
        </Link>
    );
}