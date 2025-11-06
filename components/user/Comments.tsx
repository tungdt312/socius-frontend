"use client";

import React, {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {CommentResponse} from '@/types/dtos/post'; // Sửa đường dẫn nếu cần
import {Button} from "@/components/ui/button";
import {Heart} from 'lucide-react';
import {formatISODate} from "@/lib/utils";
import {getCommentReplies} from "@/services/commentService";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {react} from "@/services/reactService";
import {reactTargetType, reactType} from "@/constants/enum";

interface CommentItemProps {
    comment: CommentResponse;
    onReplyClick?: (comment: CommentResponse) => void;
}

export const CommentItem = ({comment, onReplyClick}: CommentItemProps) => {

    const [isLiked, setIsLiked] = useState((comment.reactSummary?.currentUserReact || "") == reactType.LOVE);
    const [likeCount, setLikeCount] = useState(comment.reactCount);

    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<CommentResponse[]>([]);
    const [page, setPage] = useState(0);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);

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

    return (
        <div className="flex items-start gap-3 p-2 w-full">
            <Link href={`/user/${comment.authorId}`}>
                <Image
                    alt="avatar"
                    src={comment.authorAvatar || process.env.NEXT_PUBLIC_AVATAR_URL!}
                    height={40}
                    width={40}
                    className="size-9 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                />
            </Link>
            <div className="flex-1">
                <div className={"flex w-full"}>
                    <div className="bg-accent flex-1 rounded-xl px-3 py-2">
                        <div className="flex items-baseline gap-2">
                            <Link href={`/user/${comment.authorId}`} className="text-sm font-semibold hover:underline">
                                {comment.authorName}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                            {formatISODate(comment.createdAt)}
                        </span>
                        </div>

                        <p className="text-sm whitespace-pre-line">{comment.content}</p>

                        {comment.mediaUrl && (
                            <Image
                                src={comment.mediaUrl}
                                alt="Media bình luận"
                                width={300}
                                height={300}
                                className="mt-2 rounded-lg max-w-full h-auto"
                            />
                        )}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLike}>
                        <Heart
                            className={`size-5 ${isLiked ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`}/>
                    </Button>
                </div>
                <div className="flex items-center gap-3 px-3 py-1 text-xs text-muted-foreground">
                    <span>{likeCount} lượt thích</span>
                    <button
                        onClick={() => onReplyClick?.(comment)}
                        className="font-semibold hover:underline"
                    >
                        Trả lời
                    </button>
                    {comment.childrenCount > 0 && (
                        <button
                            onClick={handleLoadReplies}
                            disabled={isLoadingReplies}
                            className="font-semibold hover:underline"
                        >
                            {showReplies ? 'Ẩn' : 'Xem'} {comment.childrenCount} câu trả lời
                        </button>
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