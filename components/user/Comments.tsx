"use client";

import React, {useRef, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {CommentResponse, EditCommentRequest} from '@/types/dtos/post'; // Sửa đường dẫn nếu cần
import {Button} from "@/components/ui/button";
import {Ellipsis, EllipsisVertical, FileImage, Film, Heart, LoaderCircle, UserRound, X} from 'lucide-react';
import {formatISODate} from "@/lib/utils";
import {deleteComment, editComment, getCommentReplies} from "@/services/commentService";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {react} from "@/services/reactService";
import {ACCEPTED_TYPES, MAX_IMG_SIZE, reactTargetType, reactType} from "@/constants/enum";
import {useCurrentUserId} from "@/components/user/CommentForm";
import {Textarea} from "@/components/ui/textarea";
import {MediaPreview} from "@/components/user/PostForm";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

interface CommentItemProps {
    comment: CommentResponse;
    onReplyClick?: (comment: CommentResponse) => void;
}

export const CommentItem = ({comment, onReplyClick}: CommentItemProps) => {
    console.log(comment)
    const currentUser = useCurrentUserId()
    const [isLiked, setIsLiked] = useState((comment.reactSummary?.currentUserReact || "") == reactType.LOVE);
    const [likeCount, setLikeCount] = useState(comment.reactCount);

    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<CommentResponse[]>([]);
    const [page, setPage] = useState(0);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);

    const [currentComment, setCurrentComment] = useState(comment);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const handleEditSuccess = (updatedComment: CommentResponse) => {
        setCurrentComment(updatedComment); // Cập nhật comment
        setIsEditing(false); // Tắt chế độ sửa
        setIsMoreOpen(false);
        toast.success("Đã cập nhật bình luận");
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();

        // Cập nhật UI ngay lập tức (Optimistic update)
        const newIsLiked = !isLiked;
        const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
        setIsLiked(newIsLiked);
        setLikeCount(newLikeCount);

        try {
            const res = await react({
                reactTypeId: (1).toString(),
                targetId: comment.id,
                targetType: reactTargetType.COMMENT
            })
        } catch (error) {
            setIsLiked(!newIsLiked);
            setLikeCount(newIsLiked ? newLikeCount - 1 : newLikeCount + 1);
            console.error("Lỗi khi like comment:", error);
        }
    };

    const handleLoadReplies = async () => {
        if (showReplies) {
            setShowReplies(false);
            setReplies([]);
            return;
        }

        setIsLoadingReplies(true);
        try {
            const data = await getCommentReplies(comment.id);
            setPage(page + 1);
            setReplies(replies.concat(data.content));
            setShowReplies(true);
        } catch (error) {
            toast.error("Lỗi khi tải replies:" + (error as Error).message);
        } finally {
            setIsLoadingReplies(false);
        }
    };

    const handleDelComment = async () => {
        try {
            const res = await deleteComment(comment.id)
            setIsDeleted(true)
            toast.success("Đã cập nhật bình luận");
        } catch (error) {
            setIsEditing(false);
            toast.error("Sửa bình luận thất bại");
        } finally {
            setIsMoreOpen(false);
        }
    };
    return (
        <div className={`flex items-start gap-3 p-2 w-full ${isDeleted? "hidden":""}`}>
            <Link href={`/user/${currentComment.authorId}`}>
                <Avatar className={"size-8"}>
                    <AvatarImage src={currentComment.authorAvatar} className={"object-cover"}/>
                    <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex-1">
                <div className={"flex w-full"}>
                    <div className="bg-accent flex-1 rounded-xl px-3 py-2">
                        {isEditing ? (
                            <CommentEditForm
                                comment={currentComment}
                                onSuccess={(c)=> handleEditSuccess(c)}
                                onCancel={() => setIsEditing(false)}
                            />
                        ) : (
                            <>
                                <div className="flex items-baseline gap-2">
                                    <Link href={`/user/${currentComment.authorId}`}
                                          className="text-sm font-semibold hover:underline overflow-ellipsis line-clamp-1">
                                        {comment.authorName}
                                    </Link>
                                    <span
                                        className="text-xs text-muted-foreground">{formatISODate(currentComment.createdAt)}</span>
                                </div>

                                {currentComment.content && (
                                    <p className="text-sm whitespace-pre-line">{currentComment.content}</p>
                                )}
                                {currentComment.media && currentComment.media[0] && currentComment.media[0].url && currentComment.media[0].type == 'image' && (
                                    <Image
                                        src={currentComment.media[0].url}
                                        alt="Media bình luận"
                                        width={150}
                                        height={150}
                                        className="mt-2 rounded-lg h-[150px] w-[150px] object-contain"
                                    />
                                )}
                                {currentComment.media && currentComment.media[0] && currentComment.media[0].url && currentComment.media[0].type == 'video' && (
                                    <video
                                        src={currentComment.media[0].url}
                                        className="h-[150px] w-[150px] object-contain"
                                        controls muted
                                    />
                                )}
                            </>)}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLike}>
                        <Heart
                            className={`size-5 ${isLiked ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`}/>
                    </Button>
                </div>
                <div className="flex items-center gap-3 px-3 py-1 text-xs text-muted-foreground">
                    <span className={"button"}>{likeCount} lượt thích</span>
                    <Button
                        variant={"ghost"}
                        size={"sm"}
                        onClick={() => onReplyClick?.(currentComment)}
                        className="button hover:underline p-0 h-fit"
                    >
                        Trả lời
                    </Button>

                    {(currentUser && currentComment.authorId == (currentUser.id ?? "")) && !isEditing && (
                        <Popover open={isMoreOpen} onOpenChange={setIsMoreOpen} >
                            <PopoverTrigger asChild>
                                <Button size={"icon"} variant={"ghost"} className={"p-0 h-fit button hover:underline"}>
                                    <Ellipsis size={40}/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit p-0 flex flex-col">

                                <Button onClick={() => setIsEditing(true)} variant={"ghost"} className={""}>
                                    Sửa bình luận
                                </Button>
                                <Button onClick={handleDelComment} variant={"ghost"} className={"!text-destructive"}>
                                    Xóa bình luận
                                </Button>
                                <Button className={ "!text-destructive"} variant={"ghost"} onClick={async () => {
                                }}>
                                    Báo cáo bình luận
                                </Button>
                            </PopoverContent>
                        </Popover>

                    )}

                </div>
                <div className="flex items-center px-3 text-xs text-muted-foreground">
                {currentComment.childrenCount > 0 && (
                    <Button
                        variant={"ghost"}
                        size={"sm"}
                        onClick={handleLoadReplies}
                        disabled={isLoadingReplies}
                        className="button hover:underline p-0 m-0 h-fit"
                    >
                        {showReplies ? 'Ẩn' : 'Xem'} {currentComment.childrenCount} câu trả lời
                    </Button>
                )}
                </div>
                {showReplies && (
                    <div className="mt-2 space-y-2">
                        {isLoadingReplies && <div>Đang tải...</div>}
                        {replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                onReplyClick={() => onReplyClick?.(reply)}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};
interface CommentEditFormProps {
    comment: CommentResponse;
    onSuccess: (updatedComment: CommentResponse) => void;
    onCancel: () => void;
}
const CommentEditForm = ({ comment, onSuccess, onCancel }: CommentEditFormProps) => {
    const [content, setContent] = useState(comment.content || "");
    const [isLoading, setIsLoading] = useState(false);

    // (A) Thêm logic xử lý file (giống hệt CommentInputForm)
    const [newMediaPreview, setNewMediaPreview] = useState<MediaPreview | undefined>(undefined);
    const [isExistingMediaRemoved, setIsExistingMediaRemoved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // (B) Copy hàm handleFileAdd
    const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error("Loại file này không được hỗ trợ.");
            return;
        }
        if (file.size > MAX_IMG_SIZE) {
            toast.error("Ảnh quá lớn. Dung lượng tối đa là 20MB.");
            return;
        }
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';
        const url = URL.createObjectURL(file);

        // Khi thêm file mới, nó sẽ thay thế file cũ
        setNewMediaPreview({file: file, url: url, type: fileType});
        setIsExistingMediaRemoved(true); // Đánh dấu xóa file cũ
        e.target.value = "";
    };

    // (C) Copy hàm handeleFileDelete (sửa tên)
    const handeleNewFileDelete = () => {
        if (newMediaPreview) {
            URL.revokeObjectURL(newMediaPreview.url);
        }
        setNewMediaPreview(undefined);
    };

    // (D) Hàm xóa file CŨ
    const handleRemoveExistingMedia = () => {
        setIsExistingMediaRemoved(true);
    };

    // (E) Sửa lại handleSubmit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Cho phép gửi nếu có content, có file mới, hoặc chỉ là xóa file cũ
        if (!content.trim() && !newMediaPreview && !isExistingMediaRemoved && comment.content === content) {
            return onCancel(); // Không có gì thay đổi
        }

        setIsLoading(true);
        try {
            const requestData: EditCommentRequest = {
                commentId: comment.id,
                content: content,
                mediaFile: newMediaPreview?.file, // File mới
                removeImage: isExistingMediaRemoved, // Đánh dấu xóa
            };
            console.log(requestData);
            // Gọi API
            const updatedComment = await editComment(requestData);

            // Báo cho cha (CommentItem)
            onSuccess(updatedComment);

        } catch (error) {
            toast.error("Sửa bình luận thất bại.");
            setIsLoading(false);
        }
        // (Không cần setIsLoading(false) ở đây vì component sẽ unmount)
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-sm"
                rows={2}
                placeholder="Viết bình luận..."
            />

            {/* (F) Logic render preview MỚI */}

            {/* 1. Hiển thị File MỚI (nếu có) */}
            {newMediaPreview && (
                <div className="relative w-fit rounded-lg overflow-hidden border">
                    {newMediaPreview.type === 'image' ? (
                        <Image src={newMediaPreview.url} alt="Xem trước" width={100} height={100} className="h-[100px] w-[100px] object-contain" />
                    ) : (
                        <video src={newMediaPreview.url} className="h-[100px] w-[100px] object-contain" />
                    )}
                    {newMediaPreview.type === 'video' && <Film size={20} className="absolute top-1 left-1 text-white" />}
                    <Button variant="destructive" size="icon" type="button"
                            className="absolute top-1 right-1 rounded-full h-4 w-4"
                            onClick={handeleNewFileDelete} disabled={isLoading}>
                        <X className="size-3"/>
                    </Button>
                </div>
            )}

            {/* 2. Hiển thị File CŨ (nếu chưa bị xóa, và chưa có file mới) */}
            {!newMediaPreview && !isExistingMediaRemoved && comment.media && comment.media[0] && comment.media[0].url  &&  (
                <div className="relative w-fit rounded-lg overflow-hidden border">
                    {comment.media[0].type === 'image' ? (
                        <Image src={comment.media[0].url} alt="Media cũ" width={100} height={100} className="h-[100px] w-[100px] object-contain" />
                    ) : (
                        <video src={comment.media[0].url} className="h-[100px] w-[100px] object-contain" />
                    )}
                    {comment.media[0].type === 'video' && <Film size={20} className="absolute top-1 left-1 text-white" />}
                    <Button variant="destructive" size="icon" type="button"
                            className="absolute top-1 right-1 rounded-full h-4 w-4"
                            onClick={handleRemoveExistingMedia} disabled={isLoading}>
                        <X className="size-3"/>
                    </Button>
                </div>
            )}

            <div className="flex justify-between items-center">
                {/* Nút upload file (ẩn) */}
                <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileAdd}
                    className={"hidden"}
                    ref={fileInputRef}
                />
                {/* Nút kích hoạt upload */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-green-500"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                >
                    <FileImage className="size-5"/>
                </Button>

                {/* Nút Hủy / Lưu */}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button type="submit" size="sm" disabled={isLoading}>
                        {isLoading ? <LoaderCircle className={"animate-spin"}/> : "Lưu"}
                    </Button>
                </div>
            </div>
        </form>
    );
};
export const CommentSkeleton = () => (
    <div className="flex items-start gap-3 p-2 w-full">
        <Skeleton className="size-9 rounded-full"/>
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3"/> {/* User info */}
            <Skeleton className="h-4 w-3/4"/> {/* Content */}
            <Skeleton className="h-3 w-1/4"/> {/* Actions */}
        </div>
        <Skeleton className="size-6 w-6"/> {/* Like button */}
    </div>
);