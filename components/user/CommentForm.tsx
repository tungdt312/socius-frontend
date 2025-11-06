// components/comment/CommentInputForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { CommentResponse, CommentRequest } from '@/types/dtos/post'; // Giả sử bạn có type này
import { USER_KEY } from '@/constants';
import Image from "next/image";
import {comment} from "@/services/commentService"; // Giả sử

interface CommentInputFormProps {
    postId: string;
    parent?: CommentResponse; // Dùng nếu bạn muốn trả lời 1 comment khác
    onCommentPosted: (newComment: CommentResponse) => void;
}

/**
 * Một hook nhỏ để lấy avatar của người dùng đang đăng nhập
 */
export const useCurrentUserAvatar = () => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    useEffect(() => {
        const data = localStorage.getItem(USER_KEY);
        if (data) {
            setAvatarUrl(JSON.parse(data).avatarUrl);
        }
    }, []);
    return { avatarUrl };
};
export const useCurrentUserId = () => {
    const [id, setId] = useState<string | null>(null);
    useEffect(() => {
        const data = localStorage.getItem(USER_KEY);
        if (data) {
            setId(JSON.parse(data).id);
        }
    }, []);
    return { id};
};

export const CommentInputForm = ({ postId, parent, onCommentPosted }: CommentInputFormProps) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { avatarUrl } = useCurrentUserAvatar();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const requestData: CommentRequest = {
                postId: postId,
                parentId: parent?.id,
                content: content,
            };
            const res = await  comment(requestData);

            onCommentPosted(res);
            setContent(""); // Xóa input

        } catch (error) {
            toast.error("Gửi bình luận thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-start gap-3 w-full bg-background">
            <Image
                alt="avatar"
                src={avatarUrl || process.env.NEXT_PUBLIC_AVATAR_URL!}
                height={40}
                width={40}
                className="size-9 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
            />
            <div className={"w-full"}>
            {parent && (<p className={"subtitle2 text-muted-foreground "}> Đang trả lời {parent.authorName} </p>)}
            <div className="flex-1 flex items-center  bg-background">
                <Input
                    placeholder="Viết bình luận..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="rounded-full pr-12"
                    disabled={isSubmitting}
                />
                <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    disabled={isSubmitting || !content.trim()}
                >
                    <Send className="size-4" />
                </Button>
            </div>
            </div>
        </form>
    );
};