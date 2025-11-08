"use client";

import React, {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {CommentResponse, EditCommentRequest} from '@/types/dtos/post'; // Sửa đường dẫn nếu cần
import {Button} from "@/components/ui/button";
import {Heart} from 'lucide-react';
import {formatISODate} from "@/lib/utils";
import {editComment, getCommentReplies} from "@/services/commentService";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {react} from "@/services/reactService";
import {reactTargetType, reactType} from "@/constants/enum";
import {useCurrentUserId} from "@/components/user/CommentForm";
import {Textarea} from "@/components/ui/textarea";

interface CommentItemProps {
    comment: CommentResponse;
    onReplyClick?: (comment: CommentResponse) => void;
}

export const CommentItem = ({comment, onReplyClick}: CommentItemProps) => {
    const currentUser = useCurrentUserId()
    const [isLiked, setIsLiked] = useState((comment.reactSummary?.currentUserReact || "") == reactType.LOVE);
    const [likeCount, setLikeCount] = useState(comment.reactCount);

    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<CommentResponse[]>([]);
    const [page, setPage] = useState(0);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);

    const [currentComment, setCurrentComment] = useState(comment);
    const [isEditing, setIsEditing] = useState(false);

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

    const handleEditSubmit = async (content: string) => {
        try {
            const request: EditCommentRequest = {
                commentId: currentComment.id,
                content: content,
                removeImage: false, // (Form này không hỗ trợ sửa ảnh)
            };
            const updatedComment = await editComment(request);
            setCurrentComment(updatedComment); // Cập nhật comment
            setIsEditing(false); // Tắt chế độ sửa
            toast.success("Đã cập nhật bình luận");
        } catch (error) {
            toast.error("Sửa bình luận thất bại");
        }
    };
    return (
        <div className="flex items-start gap-3 p-2 w-full">
            <Link href={`/user/${currentComment.authorId}`}>
                <Image
                    alt="avatar"
                    src={currentComment.authorAvatar || process.env.NEXT_PUBLIC_AVATAR_URL!}
                    height={40}
                    width={40}
                    className="size-9 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                />
            </Link>
            <div className="flex-1">
                <div className={"flex w-full"}>
                    <div className="bg-accent flex-1 rounded-xl px-3 py-2">
                        {isEditing ? (
                            <CommentEditForm
                                comment={currentComment}
                                onSubmit={handleEditSubmit}
                                onCancel={() => setIsEditing(false)}
                            />
                        ) : (
                            <>
                                <div className="flex items-baseline gap-2">
                                    <Link href={`/user/${currentComment.authorId}`}
                                          className="text-sm font-semibold hover:underline">
                                        {comment.authorName}
                                    </Link>
                                    <span
                                        className="text-xs text-muted-foreground">{formatISODate(currentComment.createdAt)}</span>
                                </div>

                                <p className="text-sm whitespace-pre-line">{currentComment.content}</p>

                                {currentComment.mediaUrl && (
                                    <Image
                                        src={currentComment.mediaUrl}
                                        alt="Media bình luận"
                                        width={300}
                                        height={300}
                                        className="mt-2 rounded-lg max-w-full h-auto"
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
                        className="button hover:underline p-0"
                    >
                        Trả lời
                    </Button>
                    {(currentUser && currentComment.authorId == (currentUser.id ?? "")) && !isEditing && (
                        <Button onClick={() => setIsEditing(true)} variant={"ghost"} size={"sm"} className=" p-0 button hover:underline">
                            Sửa
                        </Button>
                    )}
                    {currentComment.childrenCount > 0 && (
                        <Button
                            variant={"ghost"}
                            size={"sm"}
                            onClick={handleLoadReplies}
                            disabled={isLoadingReplies}
                            className="button hover:underline p-0"
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
    onSubmit: (content: string) => void;
    onCancel: () => void;
}
const CommentEditForm = ({ comment, onSubmit, onCancel }: CommentEditFormProps) => {
    const [content, setContent] = useState(comment.content);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onSubmit(content);
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-sm"
                rows={2}
            />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
                    Hủy
                </Button>
                <Button type="submit" size="sm" disabled={isLoading || content.length==0}>
                    {isLoading ? "Đang lưu..." : "Lưu"}
                </Button>
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