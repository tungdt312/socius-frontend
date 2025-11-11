// components/comment/CommentInputForm.tsx
"use client";

import React, {useState, useEffect, useRef} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {FileImage, Film, Send, Smile, X} from 'lucide-react';
import {toast} from 'sonner';
import {CommentResponse, CommentRequest} from '@/types/dtos/post';
import {emojiCategory, USER_KEY} from '@/constants';
import Image from "next/image";
import {comment} from "@/services/commentService";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import EmojiPicker, {EmojiClickData, EmojiStyle} from "emoji-picker-react";
import {CategoriesConfig, categoryFromCategoryConfig} from "emoji-picker-react/src/config/categoryConfig";
import MyEmojipicker from "@/components/ui/emojipicker";
import {UserResponse} from "@/types/dtos/user";
import {ACCEPTED_TYPES, MAX_IMG_SIZE} from "@/constants/enum";
import {MediaPreview} from "@/components/user/PostForm";


interface CommentInputFormProps {
    className?: string;
    postId: string;
    parent?: CommentResponse; // Dùng nếu bạn muốn trả lời 1 comment khác
    onCommentPosted: (newComment: CommentResponse) => void;
    onCancelReply: () => void;
}

/**
 * Một hook nhỏ để lấy avatar của người dùng đang đăng nhập
 */
export const useCurrentUser = () => {
    const [user, setUser] = useState<UserResponse | null>(null);
    useEffect(() => {
        const data = localStorage.getItem(USER_KEY);
        if (data) {
            setUser(JSON.parse(data) as UserResponse);
        }
    }, []);
    return {...user};
};
export const useCurrentUserId = () => {
    const [id, setId] = useState<string | null>(null);
    useEffect(() => {
        const data = localStorage.getItem(USER_KEY);
        if (data) {
            setId(JSON.parse(data).id);
        }
    }, []);
    return {id};
};

export const CommentInputForm = ({
                                     className,
                                     postId,
                                     parent,
                                     onCommentPosted,
                                     onCancelReply
                                 }: CommentInputFormProps) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mediaPreview, setMediaPreview] = useState<MediaPreview | undefined>(undefined);
    const {avatarUrl} = useCurrentUser();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setContent((prev) => prev + emojiData.emoji);
    };

    const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0) || undefined;
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error("Loại file này không được hỗ trợ. Hãy thử lại với PNG/JPEG/WEBP/MP4.");
            return;
        }
        if (file.size > MAX_IMG_SIZE) {
            toast.error("Ảnh quá lớn. Dung lượng tối đa là 20MB.");
            return;
        }
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';
        const url = URL.createObjectURL(file);
        setMediaPreview({file: file, url: url, type: fileType});
        e.target.value = "";
    };
    const handeleFileDelete = () => {
        const toDelete = mediaPreview;
        if (toDelete) {
            URL.revokeObjectURL(toDelete.url);
        }
        setMediaPreview(undefined);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const requestData: CommentRequest = {
                postId: postId,
                parentId: parent?.id,
                content: content,
                mediaFile: mediaPreview?.file
            };
            const res = await comment(requestData);

            onCommentPosted(res);
            setContent(""); // Xóa input
            handeleFileDelete()

        } catch (error) {
            toast.error("Gửi bình luận thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`flex items-start gap-3 w-full bg-card ${className}`}>
            <Image
                alt="avatar"
                src={avatarUrl || process.env.NEXT_PUBLIC_AVATAR_URL!}
                height={40}
                width={40}
                className="size-9 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
            />
            <div className={"w-full"}>
                {parent && (<p className={"subtitle2 text-muted-foreground "}> Đang trả lời {parent.authorName} <Button
                    variant={"ghost"} size={"sm"} onClick={onCancelReply}>Hủy</Button></p>)}
                {mediaPreview && (
                    <div className="relative w-fit rounded-lg overflow-hidden border">
                        {mediaPreview.type === 'image' ? (
                            <Image
                                src={mediaPreview.url}
                                alt="Xem trước"
                                width={150}
                                height={150}
                                className="h-[150px] w-[150px] object-contain"
                            />
                        ) : (
                            <video
                                src={mediaPreview.url}
                                className="h-[150px] w-[150px] object-contain"
                            />
                        )}
                        {mediaPreview.type === 'video' && (
                            <Film size={20} className="absolute top-2 left-2 text-white bg-black/50 rounded-full" />
                        )}
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full h-4 w-4"
                            onClick={() => handeleFileDelete()}
                            type="button"
                        >
                            <X className="size-3"/>
                        </Button>
                    </div>
                )}
                <div className="flex-1 flex items-center bg-card">

                    <Input
                        placeholder="Viết bình luận..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="rounded-full"
                        disabled={isSubmitting}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon"><Smile className="size-5"/></Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 border-0 w-[250px]">
                            <MyEmojipicker onEmojiClick={onEmojiClick}/>
                        </PopoverContent>
                    </Popover>
                    <Input
                        placeholder={"Chọn ảnh"}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileAdd}
                        className={"hidden"}
                        ref={fileInputRef}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-green-500"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FileImage className="size-5"/>
                    </Button>
                    <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8"
                        disabled={isSubmitting || !content.trim()}
                    >
                        <Send className="size-5"/>
                    </Button>
                </div>
            </div>
        </form>
    );
};