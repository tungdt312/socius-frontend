import React from 'react'
import {PostResponse} from "@/types/dtos/post";
import {
    AlertDialog, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {useRouter} from "next/navigation";
import {deleteFriendAction} from "@/services/friendService";
import {FriendActionTypes} from "@/constants/enum";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {deletePosts} from "@/services/postService";
import {X} from "lucide-react";
import {PostEditForm} from "@/components/user/PostForm";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";

import {useCurrentUserId} from "@/components/userContext";
import ReportForm from "@/components/moderator/ReportForm";
import {ReportableType} from "@/types/dtos/report";

const PostEllipsis = ({post, children, onDelete, onEditClick}: {
    post: PostResponse,
    onDelete: () => void,
    onEditClick: (post: PostResponse) => void,
    children: React.ReactNode
}) => {
    const currentUser = useCurrentUserId()
    const isOwner = currentUser && currentUser.id === post.authorId;
    const [isOpen, setIsOpen] = React.useState(false);
    const BlockAuthor = async () => {

        try {
            const res = await deleteFriendAction(post.authorId, FriendActionTypes.block)
            toast.success("Chặn thành công")
        } catch (error) {
            toast.error((error as Error).message ?? "Lỗi không xác định")
        }

    }

    const DeletePost = async () => {

        try {
            const res = await deletePosts(post.id)
            toast.success("Xóa thành công")
            onDelete()
        } catch (error) {
            toast.error((error as Error).message ?? "Lỗi không xác định")
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="max-w-md w-full p-0 h-auto flex flex-col items-center">
                {isOwner ?
                    <>
                        <PostEditForm post={post} onSuccess={(p) => {
                            onEditClick(p)
                            setIsOpen(false)
                        }}>
                            <Button className={"w-full "} variant={"ghost"}>
                                Sửa bài viết
                            </Button>
                        </PostEditForm>
                        <ConfirmDialog title={'Xóa bài viết'}
                                       description={'Bạn có chắc muốn xóa bài viết này? Bài viết sau khi xóa sẽ không thể khôi phục.'}
                                       onConfirm={async () => {
                                           await deletePosts(post.id)
                                           onDelete()
                                           setIsOpen(false);
                                       }}>
                            <Button className={"w-full !text-destructive"} variant={"ghost"}>
                                Xóa bài viết
                            </Button>
                        </ConfirmDialog>


                    </>
                    : <>
                        <ConfirmDialog title={"Chặn người dùng"}
                                       description={"Người dùng này sẽ không thể tìm thấy hay nhắn tin cho bạn. Chúng tôi sẽ không thông báo cho người dùng biết về việc bị chặn."}
                                       onConfirm={async () => {
                                           await BlockAuthor
                                           setIsOpen(false);
                                       }}>
                            <Button className={"w-full !text-destructive"} variant={"ghost"}>
                                Chặn người dùng
                            </Button>
                        </ConfirmDialog>
                        <ReportForm targetId={post.id} targetType={ReportableType.COMMENT} >
                            <Button className={"w-full !text-destructive"} variant={"ghost"}>
                                Báo cáo bài viết
                            </Button>
                        </ReportForm>
                    </>}
            </PopoverContent>
        </Popover>
    )
}
export default PostEllipsis
