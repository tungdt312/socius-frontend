"use client"
import React, {useEffect, useRef, useState} from 'react'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Lock, Globe, PlusSquare, Users, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {PostRequest, PostResponse} from "@/types/dtos/post";
import {useCurrentUserAvatar} from "@/components/user/CommentForm";
import {toast} from "sonner";
import {ACCEPTED_TYPES, MAX_IMG_SIZE, postAccess} from '@/constants/enum';
import {createPost, getPostById} from "@/services/postService";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import Image from "next/image";
import {Textarea} from '@/components/ui/textarea';
import {Input} from "@/components/ui/input";
import {Skeleton} from "@/components/ui/skeleton";
import {formatISODate} from "@/lib/utils";

export interface PostFormProps {
    children: React.ReactNode;
    shareId?: string;
    onPostCreated: (newPost: PostResponse) => void;
}
export const SharedPostPreview = ({ post }: { post: PostResponse }) => (
    <div className="mt-2 border border-border rounded-lg">
        <div className="flex items-center gap-3 p-3 bg-accent/50">
            <Image
                alt="avatar"
                src={post.authorAvatar || process.env.NEXT_PUBLIC_AVATAR_URL!}
                height={32}
                width={32}
                className="size-8 object-cover rounded-full"
            />
            <div className="flex flex-col">
                <span className="font-semibold text-sm">{post.authorName}</span>
                <span className="text-xs text-muted-foreground">{formatISODate(post.createdAt)}</span>
            </div>
        </div>
        <div className="p-0">
            {post.content && (
                <div className="px-3 pt-2 pb-3 text-sm whitespace-pre-line max-h-24 overflow-y-auto">
                    {post.content}
                </div>
            )}
            {post.mediaUrl && (
                <div className="w-full bg-muted-foreground overflow-hidden h-fit">
                    <Image
                        src={post.mediaUrl}
                        alt="Nội dung bài post"
                        width={400}
                        height={200}
                        className="w-full h-auto object-contain"
                    />
                </div>
            )}
        </div>
    </div>
);

export const SharedPostSkeleton = () => (
    <div className="mt-2 border border-border rounded-lg overflow-hidden p-3 space-y-2 animate-pulse">
        <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
    </div>
);
const PostForm = ({onPostCreated, children, shareId}: PostFormProps) => {
    const [content, setContent] = useState("");
    const [mediaFile, setMediaFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined); // URL xem trước
    const [isLoading, setIsLoading] = useState(false);
    const [access, setAccess] = useState<postAccess>(postAccess.PUBLIC);
    const [sharePostId, setSharePostId] = useState<string | undefined>(shareId);
    const [sharedPostPreview, setSharedPostPreview] = useState<PostResponse | undefined>(undefined);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const {avatarUrl} = useCurrentUserAvatar();

    useEffect(() => {
        // Chỉ fetch khi có shareId và chưa có dữ liệu
        if (shareId && !sharedPostPreview) {
            const fetchSharedPost = async () => {
                setIsLoadingPreview(true);
                try {
                    // Gọi API của bạn để lấy chi tiết bài post
                    const postData = await getPostById(shareId);
                    setSharedPostPreview(postData);
                } catch (err) {
                    toast.error("Không thể tải bài viết để chia sẻ.");
                } finally {
                    setIsLoadingPreview(false);
                }
            };
            fetchSharedPost();
        } else if (!shareId) {
            setSharedPostPreview(undefined); // Clear preview nếu không có shareId
        }
    }, [shareId, sharedPostPreview]);
    useEffect(() => {
        if (!mediaFile) {
            setPreviewUrl(undefined);
            return;
        }
        const url = URL.createObjectURL(mediaFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [mediaFile]);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || undefined;
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error("Loại file này không được hỗ trợ. Hãy thử lại với PNG/JPEG/WEBP.");
            return;
        }
        if (file.size > MAX_IMG_SIZE) {
            toast.error("Ảnh quá lớn. Dung lượng tối đa là 2MB.");
            return;
        }
        setMediaFile(file);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !mediaFile) return;

        setIsLoading(true);

        try {
            const requestData: PostRequest = {
                content: content,
                accessModifier: access,
                sharedPostId: sharePostId,
                media: mediaFile
            };

            const newPost = await createPost(requestData);

            toast.success("Đăng bài thành công!");
            setContent("");
            setMediaFile(undefined);
            setPreviewUrl(undefined);
            setSharePostId(undefined);
            setAccess(postAccess.PUBLIC);
            onPostCreated(newPost);

        } catch (error) {
            toast.error((error as Error).message || "Đăng bài thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md w-full flex flex-col items-center gap-2">
                <AlertDialogHeader className="relative w-full">
                    <AlertDialogTitle
                        className="heading5 text-center w-full">{shareId ? "Chia sẻ bài viết" : "Tạo bài viết"}</AlertDialogTitle>
                    <AlertDialogCancel className="size-fit !p-1 aspect-square absolute right-0 rounded-full">
                        <X/>
                    </AlertDialogCancel>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit} className="w-full flex items-start gap-3">
                    <Image
                        alt="avatar"
                        src={avatarUrl || process.env.NEXT_PUBLIC_AVATAR_URL!}
                        height={40}
                        width={40}
                        className="size-10 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                    />

                    <div className="flex-1 space-y-3">
                        <Textarea
                            placeholder={shareId ? "Nói gì đó về bài viết này..." : "Bạn đang nghĩ gì?"}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full border-none focus-visible:ring-0 shadow-none p-0"
                            rows={3}
                            disabled={isLoading}
                        />
                        {isLoadingPreview && <SharedPostSkeleton />}
                        {sharedPostPreview && <SharedPostPreview post={sharedPostPreview} />}
                        {previewUrl && (
                            <div className="relative w-full rounded-lg overflow-hidden border">
                                <Image
                                    src={previewUrl}
                                    alt="Xem trước"
                                    width={500}
                                    height={300}
                                    className="h-fit w-full object-contain"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 rounded-full h-6 w-6"
                                    onClick={() => setMediaFile(undefined)}
                                    disabled={isLoading}
                                >
                                    <X className="size-4"/>
                                </Button>
                            </div>
                        )}

                        <div className="w-full justify-end flex items-center gap-2">
                            {!sharePostId && <Input
                                placeholder={"Chọn ảnh"}
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                            />}
                            <Select
                                value={access}
                                onValueChange={(value) => setAccess(value as postAccess)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-auto rounded-full text-xs h-9 px-3 gap-2">
                                    <SelectValue placeholder="Chọn đối tượng"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem key={"PUBLIC"} value={"PUBLIC"}>
                                        <div className="flex items-center gap-2">
                                            <Globe className="size-4"/>
                                            <span>Công khai</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem key={"FRIENDS"} value={"FRIENDS"}>
                                        <div className="flex items-center gap-2">
                                            <Users className="size-4"/>
                                            <span>Bạn bè</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem key={"PRIVATE"} value={"PRIVATE"}>
                                        <div className="flex items-center gap-2">
                                            <Lock className="size-4"/>
                                            <span>Chỉ mình tôi</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                type="submit"
                                disabled={isLoading || (!content.trim() && !mediaFile)}
                            >
                                {isLoading ? "Đang đăng..." : "Đăng bài"}
                            </Button>
                        </div>
                    </div>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
export default PostForm


