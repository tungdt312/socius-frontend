"use client"
import React, {useEffect, useRef, useState} from 'react'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Lock, Globe, PlusSquare, Users, X, Smile, FileImage, Film, UserRound} from "lucide-react";
import {Button} from "@/components/ui/button";
import {EditPostRequest, PostMedia, PostRequest, PostResponse, SharePostRequest} from "@/types/dtos/post";
import {toast} from "sonner";
import {ACCEPTED_TYPES, MAX_IMG_SIZE, postAccess} from '@/constants/enum';
import {createPost, editPost, getPostById, sharePost} from "@/services/postService";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import Image from "next/image";
import {Textarea} from '@/components/ui/textarea';
import {Input} from "@/components/ui/input";
import {Skeleton} from "@/components/ui/skeleton";
import {formatISODate} from "@/lib/utils";
import Link from "next/link";
import {DisablePost, getAccessIcon, PostBody, PostHeader, PostMediaShow} from "@/components/user/Post";
import {Separator} from "@/components/ui/separator";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";
import EmojiPickerReact from "emoji-picker-react/src/EmojiPickerReact";
import MyEmojipicker from "@/components/ui/emojipicker";
import {EmojiClickData} from "emoji-picker-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useCurrentUser} from "@/components/userContext";

export interface PostFormProps {
    children: React.ReactNode;
    shareId?: string;
    onPostCreated: (newPost: PostResponse) => void;
}

export const SharedPostPreview = ({post}: { post: PostResponse }) => (
    <div className="mt-2 border border-border rounded-lg">
        <div className="flex items-center gap-3 p-3 bg-accent/50">
            <Avatar className={"size-10"}>
                <AvatarImage src={post.authorAvatar} className={"object-cover"}/>
                <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
            </Avatar>
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
            {post.media && post.media.length > 0 && (
                <PostMediaShow media={post.media}/>
            )}
        </div>
    </div>
);
export const SharedPostSkeleton = () => (
    <div className="mt-2 border border-border rounded-lg overflow-hidden p-3 space-y-2 animate-pulse">
        <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full"/>
            <div className="space-y-1">
                <Skeleton className="h-4 w-24"/>
                <Skeleton className="h-3 w-16"/>
            </div>
        </div>
        <Skeleton className="h-4 w-full"/>
        <Skeleton className="h-4 w-3/4"/>
    </div>
);

export interface MediaPreview {
    file: File;
    url: string;      // URL.createObjectURL()
    type: 'image' | 'video'; // Kiểu file
}

const PostForm = ({onPostCreated, children, shareId}: PostFormProps) => {
    const [content, setContent] = useState("");
    const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [access, setAccess] = useState<postAccess>(postAccess.PUBLIC);
    const [sharePostId, setSharePostId] = useState<string | undefined>(shareId);
    const [sharedPostPreview, setSharedPostPreview] = useState<PostResponse | undefined>(undefined);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const {avatarUrl, displayName} = useCurrentUser();
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetFormAndClose = () => {
        setContent("");
        mediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        setMediaPreviews([]);
        setSharePostId(undefined);
        setSharedPostPreview(undefined);
        setIsLoadingPreview(false);
        setAccess(postAccess.PUBLIC);
        setIsLoading(false);
        setIsOpen(false); // <-- Đóng dialog
    };
    useEffect(() => {
        if (shareId && !sharedPostPreview) {
            const fetchSharedPost = async () => {
                setIsLoadingPreview(true);
                try {
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

    const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files || [];
        if (files.length < 1) return
        Array.from(files).forEach((file) => {
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
            setMediaPreviews(prev => [...prev, {file: file, url: url, type: fileType}]);
            e.target.value = "";
        })
    };
    const handeleFileDelete = (i: number) => {
        const toDelete = mediaPreviews[i];
        if (toDelete) {
            URL.revokeObjectURL(toDelete.url);
        }
        setMediaPreviews(mediaPreviews.filter((_, index) => index !== i));
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (shareId && sharePostId) {
            try {

                const requestData: SharePostRequest = {
                    caption: content,
                    accessModifier: access,
                    originalPostId: sharePostId,
                };
                const newPost = await sharePost(requestData);
                toast.success("Chia sẻ thành công!");
                resetFormAndClose();
            } catch (error) {
                toast.error((error as Error).message || "chia sẻ thất bại.");
                setIsLoading(false);
            }
        }
        else {
            try {
                const requestData: PostRequest = {
                    content: content,
                    accessModifier: access,
                    media: mediaPreviews.map(p => p.file),
                };
                const newPost = await createPost(requestData);
                toast.success("Đăng bài thành công!");
                resetFormAndClose();
            } catch (error) {
                toast.error((error as Error).message || "Đăng bài thất bại.");
                setIsLoading(false);
            }
        }
    };
    const onEmojiClick = (emojiData: EmojiClickData) => {
        setContent((prev) => prev + emojiData.emoji);
    };
    return (
        <AlertDialog onOpenChange={setIsOpen} open={isOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="w-full h-fit max-h-3/4 flex flex-col items-center gap-2">
                <AlertDialogHeader className="relative w-full">
                    <AlertDialogTitle
                        className="heading5 text-center w-full">{shareId ? "Chia sẻ bài viết" : "Tạo bài viết"}</AlertDialogTitle>
                    <ConfirmDialog title={"Bạn vẫn chưa hoàn tất"}
                                   description={"Những hành động của bạn sẽ không được hệ thống ghi nhận. Bạn vẫn muốn thoát?"}
                                   onConfirm={async () => {
                                       resetFormAndClose()
                                   }}>
                        <Button className="size-fit !p-1 aspect-square absolute right-0 rounded-full">
                            <X/>
                        </Button>
                    </ConfirmDialog>
                </AlertDialogHeader>
                <Separator/>
                <form onSubmit={handleSubmit} className="w-full flex-1 overflow-auto flex-col items-start space-y-3 ">
                    <div className="flex flex-row w-full items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <Avatar className={"size-10"}>
                                <AvatarImage src={avatarUrl} className={"object-cover"}/>
                                <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                                <p className="subtitle1 hover:underline">
                                    {displayName}
                                </p>
                                <Select
                                    value={access}
                                    onValueChange={(value) => setAccess(value as postAccess)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger size={"sm"}
                                                   className="w-fit h-fit py-0 gap-1  rounded-full caption ">
                                        <SelectValue placeholder="Chọn đối tượng"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={postAccess.PUBLIC}>Công khai</SelectItem>
                                        <SelectItem value={postAccess.FRIENDS}>Bạn bè</SelectItem>
                                        <SelectItem value={postAccess.PRIVATE}>Chỉ mình tôi</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-3">
                        <Textarea
                            placeholder={shareId ? "Nói gì đó về bài viết này..." : "Bạn đang nghĩ gì?"}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full border-none focus-visible:ring-0 shadow-none p-2"
                            rows={3}
                            disabled={isLoading}
                        />
                        <div className="w-full justify-end flex flex-col items-center gap-2">
                            <div className="w-full justify-end flex  items-center gap-0">
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
                                    multiple
                                />
                                {!sharePostId &&
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-green-500"
                                        // C. Kích hoạt input ẩn khi click
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isLoading}
                                    >
                                        <FileImage className="size-5"/>
                                    </Button>
                                }
                            </div>
                        </div>
                        {isLoadingPreview && <SharedPostSkeleton/>}
                        {sharedPostPreview && <SharedPostPreview post={sharedPostPreview}/>}
                        {mediaPreviews.length > 0 && (
                            <div className="flex items-start flex-wrap w-full gap-2">
                                {mediaPreviews.map((preview, index) => (
                                    <div className="relative w-fit rounded-lg overflow-hidden border" key={index}>

                                        {preview.type === 'image' ? (
                                            <Image
                                                src={preview.url}
                                                alt="Xem trước"
                                                width={150}
                                                height={150}
                                                className="h-[150px] w-[150px] object-contain"
                                            />
                                        ) : (
                                            <video
                                                src={preview.url}
                                                className="h-[150px] w-[150px] object-contain"
                                            />
                                        )}
                                        {preview.type === 'video' && (
                                            <Film size={20} className="absolute top-2 left-2 text-white bg-black/50 rounded-full" />
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 rounded-full h-4 w-4"
                                            onClick={() => handeleFileDelete(index)}
                                            disabled={isLoading}
                                            type="button"
                                        >
                                            <X className="size-3"/>
                                        </Button>
                                    </div>))}
                            </div>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className={"w-full sticky bottom-0"}
                        disabled={isLoading || (!content.trim() && mediaPreviews.length == 0 && !shareId)}
                    >
                        {isLoading ? "Đang đăng..." : "Đăng bài"}
                    </Button>
                </form>

            </AlertDialogContent>
        </AlertDialog>
    )
}
export default PostForm


interface PostEditFormProps {
    post: PostResponse;
    onSuccess: (updatedPost: PostResponse) => void;
    children: React.ReactNode;
}

export const PostEditForm = ({onSuccess, children, post}: PostEditFormProps) => {
    const [content, setContent] = useState(post.content || "");
    const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
    const [keepMediaUrls, setkeepMediaUrls] = useState<PostMedia[]>(post.media || []);
    const [removeMediaUrls, setRemoveMediaUrls] = useState<PostMedia[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [access, setAccess] = useState<postAccess>(postAccess.PUBLIC);
    const {avatarUrl, displayName} = useCurrentUser();
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {sharedPost, sharedPostId} = post

    const resetFormAndClose = () => {
        setContent("");
        mediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        setMediaPreviews([]);
        setAccess(postAccess.PUBLIC);
        setIsLoading(false);
        setIsOpen(false); // <-- Đóng dialog
    };

    const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files || [];
        if (files.length < 1) return
        Array.from(files).forEach((file) => {
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
            setMediaPreviews(prev => [...prev, {file: file, url: url, type: fileType}]);
            e.target.value = "";
        })
    };
    const handleFileDelete = (i: number) => {
        const toDelete = mediaPreviews[i];
        if (toDelete) {
            URL.revokeObjectURL(toDelete.url);
        }
        setMediaPreviews(mediaPreviews.filter((_, index) => index !== i));
    }
    const handleRemoveUrl = (i: number) => {
        const itemToRemove = keepMediaUrls[i];
        if (!itemToRemove) return;
        setRemoveMediaUrls(prev => [...prev, itemToRemove]);
        setkeepMediaUrls(keepMediaUrls.filter((_, index) => index !== i));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const requestData: EditPostRequest = {
                content: content,
                accessModifier: access,
                media: mediaPreviews.map(p => p.file),
                keepMediaUrls: keepMediaUrls.map(i => i.url),
                removeMediaUrls: removeMediaUrls.map(i => i.url),
                postId: post.id,
            };
            const newPost = await editPost(requestData);
            toast.success("Chỉnh sửa thành công.");
            onSuccess(newPost);
            resetFormAndClose();
        } catch (error) {
            toast.error((error as Error).message || "Chỉnh sửa thất bại.");
            setIsLoading(false);
        }
    };
    const onEmojiClick = (emojiData: EmojiClickData) => {
        setContent((prev) => prev + emojiData.emoji);
    };
    return (
        <AlertDialog onOpenChange={setIsOpen} open={isOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="w-full h-fit max-h-3/4 flex flex-col items-center gap-2">
                <AlertDialogHeader className="relative w-full">
                    <AlertDialogTitle
                        className="heading5 text-center w-full">Chỉnh sửa bài viết</AlertDialogTitle>
                    <ConfirmDialog title={"Bạn vẫn chưa hoàn tất"}
                                   description={"Những hành động của bạn sẽ không được hệ thống ghi nhận. Bạn vẫn muốn thoát?"}
                                   onConfirm={async () => {
                                       resetFormAndClose()
                                   }}>
                        <Button className="size-fit !p-1 aspect-square absolute right-0 rounded-full">
                            <X/>
                        </Button>
                    </ConfirmDialog>
                </AlertDialogHeader>
                <Separator/>
                <form onSubmit={handleSubmit} className="w-full flex-1 overflow-auto flex-col items-start space-y-3 ">
                    <div className="flex flex-row w-full items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <Avatar className={"size-10"}>
                                <AvatarImage src={avatarUrl} className={"object-cover"}/>
                                <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                                <p className="subtitle1 hover:underline">
                                    {displayName}
                                </p>
                                <Select
                                    value={access}
                                    onValueChange={(value) => setAccess(value as postAccess)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger size={"sm"}
                                                   className="w-fit h-fit py-0 gap-1  rounded-full caption ">
                                        <SelectValue placeholder="Chọn đối tượng"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={postAccess.PUBLIC}>Công khai</SelectItem>
                                        <SelectItem value={postAccess.FRIENDS}>Bạn bè</SelectItem>
                                        <SelectItem value={postAccess.PRIVATE}>Chỉ mình tôi</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-3">
                        <Textarea
                            placeholder={sharedPostId ? "Nói gì đó về bài viết này..." : "Bạn đang nghĩ gì?"}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full border-none focus-visible:ring-0 shadow-none p-2"
                            rows={3}
                            disabled={isLoading}
                        />
                        <div className="w-full justify-end flex flex-col items-center gap-2">
                            <div className="w-full justify-end flex  items-center gap-0">
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
                                    multiple
                                />
                                {!sharedPostId &&
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
                                }
                            </div>


                        </div>
                        {sharedPostId && sharedPost && (
                            <div className="mx-2 pt-2 sm:mx-4 mb-2 border border-border rounded-lg overflow-hidden">
                            <PostHeader post={sharedPost}/>
                            <PostBody post={sharedPost}/>
                        </div>)}
                        {sharedPostId && !sharedPost && (
                            <div className="mx-2 sm:mx-4">
                                <DisablePost/>
                            </div>
                        )}
                        {(mediaPreviews.length > 0 || keepMediaUrls.length > 0) && (
                            <div className="flex items-start flex-wrap w-full gap-2">
                                {keepMediaUrls.map((url, index) => (
                                    <div className="relative w-fit rounded-lg overflow-hidden border" key={index}>
                                        {url.type === 'image' ? (
                                            <Image
                                                src={url.url}
                                                alt="Xem trước"
                                                width={150}
                                                height={150}
                                                className="h-[150px] w-[150px] object-contain"
                                            />
                                        ) : (
                                            <video
                                                src={url.url}
                                                className="h-[150px] w-[150px] object-contain"
                                            />
                                        )}
                                        {url.type === 'video' && (
                                            <Film size={20} className="absolute top-2 left-2 text-foreground/50" />
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 rounded-full h-4 w-4"
                                            onClick={() => handleRemoveUrl(index)}
                                            disabled={isLoading}
                                            type="button"
                                        >
                                            <X className="size-3"/>
                                        </Button>
                                    </div>
                                ))}
                                {mediaPreviews.map((preview, index) => (
                                    <div className="relative w-fit rounded-lg overflow-hidden border" key={index}>

                                        {preview.type === 'image' ? (
                                            <Image
                                                src={preview.url}
                                                alt="Xem trước"
                                                width={150}
                                                height={150}
                                                className="h-[150px] w-[150px] object-contain"
                                            />
                                        ) : (
                                            <video
                                                src={preview.url}
                                                className="h-[150px] w-[150px] object-contain"
                                            />
                                        )}
                                        {preview.type === 'video' && (
                                            <Film size={20} className="absolute top-2 left-2 text-white bg-black/50 rounded-full p-1" />
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 rounded-full h-4 w-4"
                                            onClick={() => handleFileDelete(index)}
                                            disabled={isLoading}
                                            type="button"
                                        >
                                            <X className="size-3"/>
                                        </Button>
                                    </div>))}
                            </div>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className={"w-full sticky bottom-0"}
                        disabled={isLoading || (!content.trim() && mediaPreviews.length == 0)}
                    >
                        {isLoading ? "Đang lưu..." : "Lưu chỉnh sửa"}
                    </Button>
                </form>

            </AlertDialogContent>
        </AlertDialog>
    )
}
