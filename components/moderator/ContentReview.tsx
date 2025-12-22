// PostViewer.tsx
"use client";

import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {cn, formatISODate} from "@/lib/utils";
import {
    AlertTriangle,
    Clock,
    CornerDownRight,
    Globe,
    Heart,
    Loader2,
    Lock,
    Mail,
    MessageSquare,
    Repeat,
    ShieldAlert,
    User
} from 'lucide-react';
import {Badge} from "@/components/ui/badge";
import Image from 'next/image';
import {CommentResponse, PostMedia, PostResponse} from "@/types/dtos/post";
import {AccountStatus, postAccess} from "@/constants/enum";
import {getPostById} from "@/services/postService";
import {blockUser, getCommentById, getMessageById, getUserById, unblockUser, block, unblock} from "@/services/moderatorService";
import {ModeratorMessage, ModeratorUser} from "@/types/dtos/moderator";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {ReportableType} from "@/types/dtos/report";

interface PostViewerProps {
    postId: string;
}

// Map cho Access Modifier
const ACCESS_CONFIG: Record<postAccess, { label: string, icon: React.FC<any> }> = {
    PUBLIC: {label: "Công khai", icon: Globe},
    PRIVATE: {label: "Riêng tư", icon: Lock},
    FRIENDS: {label: "Bạn bè", icon: User},
    // Thêm các loại access khác nếu cần
};

// Component con để render media
const MediaRenderer = ({media}: { media: PostMedia[] }) => (
    <div className="grid grid-cols-2 gap-2 mt-4">
        {media.map((m, index) => (
            <div key={index} className="relative w-full aspect-video">
                {m.type.startsWith('image') ? (
                    <Image
                        src={m.url}
                        alt={`Media ${index}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                    />
                ) : (
                    <video src={m.url} controls className="w-full h-full rounded-md object-cover"/>
                )}
            </div>
        ))}
    </div>
);
export const PostViewer = ({postId}: PostViewerProps) => {
    const [post, setPost] = useState<PostResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const loadPost = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPostById(postId);
            setPost(data);
        } catch (err) {
            setError("Không thể tải chi tiết bài viết.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {

        if (postId) {
            loadPost();
        }
    }, [postId]);
    const handleBlock = async () => {
        if (!post) return
        try {
            setIsLoading(true);
            // Giả lập gọi API xóa
            const res = await block(post.id, ReportableType.POST);
            await loadPost()

        } catch (error) {
            toast.error((error as Error).message ?? "Không thể khoá bài viết");
        } finally {
            setIsLoading(false);
        }
        // Cần thêm logic đóng drawer và reload bảng ở đây
    };
    const handleUnblock = async () => {
        if (!post) return
        try {

            setIsLoading(true);
            // Giả lập gọi API xóa
            const res = await unblock(post.id,  ReportableType.POST)
            await loadPost()
        } catch (error) {
            toast.error((error as Error).message ?? "Không thể mở khoá bài viết");
        } finally {
            setIsLoading(false);
        }
    };
    if (isLoading) {
        return <Card className="p-4 flex justify-center"><Loader2 className="animate-spin mr-2 h-5 w-5"/> Đang
            tải...</Card>;
    }

    if (error || !post) {
        return <Card
            className="p-4 border-red-400 bg-red-50 text-red-700">Lỗi: {error || "Không tìm thấy bài viết."}</Card>;
    }

    const isDeleted = !!post.deletedAt;
    const AccessIcon = ACCESS_CONFIG[post.accessModifier]?.icon || Globe;

    return (
        <Card className={cn("w-full", isDeleted && "border-dashed border-red-500 bg-red-50/20")}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={post.authorAvatar} className={"object-cover"}/>
                        <AvatarFallback>{post.authorName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base">{post.authorName}</CardTitle>
                        <CardDescription className="text-xs">
                            {formatISODate(post.createdAt)}
                            {post.updatedAt !== post.createdAt && ` (Sửa: ${formatISODate(post.updatedAt)})`}
                        </CardDescription>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <Badge variant={isDeleted ? "destructive" : "secondary"}>
                        {isDeleted ? 'Đã bị khóa' : 'Hoạt động'}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <AccessIcon className="mr-1 h-3 w-3"/>
                        {ACCESS_CONFIG[post.accessModifier]?.label || 'Lỗi truy cập'}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                {isDeleted && (
                    <div className="mb-3 text-red-600 dark:text-red-400 italic flex items-center body2">
                        <AlertTriangle className="mr-2 h-4 w-4"/>
                        Bài viết đã bị xóa vào {formatISODate(post.deletedAt!)}
                    </div>
                )}

                <p className="whitespace-pre-wrap text-sm mb-3">{post.content}</p>

                {post.media && post.media.length > 0 && <MediaRenderer media={post.media}/>}

                {/* Hiển thị bài viết được chia sẻ */}
                {post.sharedPost && (
                    <div className="mt-4 border p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <span className="text-xs font-medium text-muted-foreground mb-1 block">Bài viết gốc được chia sẻ:</span>
                        <PostViewer postId={post.sharedPostId}/> {/* Tự đệ quy hoặc dùng component riêng */}
                    </div>
                )}

                {/* Thống kê */}
                <div className="flex items-center justify-between mt-4 border-t pt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-500"/> {post.reactCount}
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4"/> {post.commentCount}
                        </div>
                        <div className="flex items-center gap-1">
                            <Repeat className="h-4 w-4"/> {post.shareCount}
                        </div>
                    </div>
                </div>
                <div className="pt-4 border-t mt-4 flex flex-col justify-end gap-2">
                    {/* Nút Khóa/Mở khóa */}
                    {/* Giả định hàm blockUser và unblockUser có sẵn */}
                    <Button className={"w-full"}
                            variant={isDeleted ? "default" : "destructive"}
                            onClick={!isDeleted ? handleBlock : handleUnblock}>
                        {isDeleted ? 'Mở Khóa' : 'Khóa Bài viết'}
                    </Button>

                </div>
            </CardContent>
        </Card>
    );
};

interface CommentViewerProps {
    commentId: string;
}

export const CommentViewer = ({commentId}: CommentViewerProps) => {
    const [comment, setComment] = useState<CommentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const loadComment = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getCommentById(commentId);
            setComment(data);
        } catch (err) {
            setError("Không thể tải chi tiết bình luận.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (commentId) {
            loadComment();
        }
    }, [commentId]);
    const handleBlock = async () => {
        if (!comment) return
        try {
            setIsLoading(true);
            // Giả lập gọi API xóa
            const res = await block(comment.id, ReportableType.COMMENT);
            await loadComment()

        } catch (error) {
            toast.error((error as Error).message ?? "Không thể khoá bình luận");
        } finally {
            setIsLoading(false);
        }
        // Cần thêm logic đóng drawer và reload bảng ở đây
    };
    const handleUnblock = async () => {
        if (!comment) return
        try {

            setIsLoading(true);
            // Giả lập gọi API xóa
            const res = await unblock(comment.id,  ReportableType.COMMENT)
            await loadComment()
        } catch (error) {
            toast.error((error as Error).message ?? "Không thể mở khoá bình luận");
        } finally {
            setIsLoading(false);
        }
    };
    if (isLoading) {
        return <Card className="p-4 flex justify-center"><Loader2 className="animate-spin mr-2 h-5 w-5"/> Đang
            tải...</Card>;
    }

    if (error || !comment) {
        return <Card
            className="p-4 border-red-400 bg-red-50 text-red-700">Lỗi: {error || "Không tìm thấy bình luận."}</Card>;
    }

    const isDeleted = !!comment.deletedAt;

    return (
        <Card className={cn("w-full", isDeleted && "border-dashed border-red-500 bg-red-50/20")}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={comment.authorAvatar} className={"object-cover"}/>
                        <AvatarFallback>{comment.authorName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-sm flex items-center">
                            {comment.authorName}
                            {comment.parentId && <CornerDownRight className="ml-2 h-3 w-3 text-muted-foreground"/>}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            ID bài viết: {comment.postId}
                        </CardDescription>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <Badge variant={isDeleted ? "destructive" : "secondary"}>
                        {isDeleted ? 'Đã bị khóa' : 'Hoạt động'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatISODate(comment.createdAt)}</span>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                {isDeleted && (
                    <div className="mb-3 text-red-600 dark:text-red-400 italic flex items-center body2">
                        <AlertTriangle className="mr-2 h-4 w-4"/>
                        Bình luận đã bị xóa vào {formatISODate(comment.deletedAt!)}
                    </div>
                )}

                <p className="whitespace-pre-wrap text-sm mb-3">{comment.content}</p>

                {comment.media && comment.media.length > 0 && <MediaRenderer media={comment.media}/>}

                {/* Thống kê */}
                <div className="flex items-center justify-between mt-4 border-t pt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-500"/> {comment.reactCount}
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4"/> {comment.childrenCount}
                        </div>
                    </div>
                </div>
                <div className="pt-4 border-t mt-4 flex flex-col justify-end gap-2">
                    {/* Nút Khóa/Mở khóa */}
                    {/* Giả định hàm blockUser và unblockUser có sẵn */}
                    <Button className={"w-full"}
                            variant={isDeleted ? "default" : "destructive"}
                            onClick={!isDeleted ? handleBlock : handleUnblock}>
                        {isDeleted ? 'Mở Khóa' : 'Khóa Bình luận'}
                    </Button>

                </div>
            </CardContent>
        </Card>
    );
};

interface MessageViewerProps {
    messageId: string;
}

export const MessageViewer = ({messageId}: MessageViewerProps) => {
    const [message, setMessage] = useState<ModeratorMessage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Giả định: Người kiểm duyệt (Moderator) không phải là người gửi tin nhắn này.
    // Nếu cần xác định isMe, cần truyền thêm moderatorId vào.
    const isMe = false; // Luôn coi là người khác gửi để hiển thị đúng luồng tin nhắn

    useEffect(() => {
        const loadMessage = async () => {
            setIsLoading(true);
            setError(null);
            // LƯU Ý: Hàm getMessageById của bạn gọi đến endpoint của COMMENT.
            // Tôi giả định endpoint đúng là /moderation/message/{id}
            // const data = await apiFetch(`/moderation/message/${messageId}`, ...);

            try {
                const data = await getMessageById(messageId);
                setMessage(data);
            } catch (err) {
                setError("Không thể tải chi tiết tin nhắn.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (messageId) {
            loadMessage();
        }
    }, [messageId]);

    if (isLoading) {
        return <Card className="p-4 flex justify-center"><Loader2 className="animate-spin mr-2 h-5 w-5"/> Đang
            tải...</Card>;
    }

    if (error || !message) {
        return <Card
            className="p-4 border-red-400 bg-red-50 text-red-700">Lỗi: {error || "Không tìm thấy tin nhắn."}</Card>;
    }

    return (
        <Card className="w-full">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Thông tin Tin nhắn</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {/* HIỂN THỊ DẠNG CHAT BUBBLE */}
                <div className={cn(
                    "flex gap-2",
                    isMe ? "justify-end" : "justify-start"
                )}>
                    {/* Avatar người gửi (Luôn hiện nếu không phải tôi) */}
                    <Avatar className="h-8 w-8 self-end">
                        <AvatarImage src={message.senderAvatar} className={"object-cover"}/>
                        <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                    </Avatar>

                    <div className={cn(
                        "max-w-[80%] p-3 rounded-xl shadow-md",
                        isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                    )}>
                        <p className={cn("text-xs font-semibold mb-1", isMe ? "text-primary-foreground/90" : "text-muted-foreground")}>
                            {message.senderName} ({message.senderId})
                        </p>

                        {/* Nội dung tin nhắn */}
                        {message.content && <p className="whitespace-pre-wrap text-sm">{message.content}</p>}

                        {/* Media */}
                        {message.media && message.media.length > 0 && <MediaRenderer media={message.media}/>}

                        {/* Thời gian */}
                        <div className={cn(
                            "flex items-center text-xs mt-1",
                            isMe ? "justify-end text-primary-foreground/70" : "justify-start text-muted-foreground"
                        )}>
                            <Clock className="h-3 w-3 mr-1"/> {formatISODate(message.sentAt)}
                        </div>
                    </div>
                </div>

                {/* Thông tin thêm cho người kiểm duyệt */}
                <div className="mt-4 pt-3 border-t text-sm text-muted-foreground space-y-1">
                    <p>ID Hội thoại: <span className="font-mono text-xs">{message.conversationId}</span></p>
                    <p>ID Tin nhắn: <span className="font-mono text-xs">{message.id}</span></p>
                </div>
            </CardContent>
        </Card>
    );
};

interface UserReviewerProps {
    userId: string;
}

export const UserReviewer = ({userId}: UserReviewerProps) => {
    const [user, setUser] = useState<ModeratorUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [note, setNote] = useState<string>("");
    const statusConfig: Record<string, any> = {
        ACTIVE: {label: "Hoạt động", variant: "default", className: "bg-green-600"},
        BLOCKED: {label: "Đã khóa", variant: "destructive"},
        PENDING: {label: "Chờ xác nhận", variant: "secondary", className: "bg-yellow-100 text-yellow-800"},
        NOT_AUTHORIZED: {label: "Chờ cấp quyền", variant: "secondary"},
        NOT_SOLVED: {label: "Chờ xử lý", variant: "secondary", className: "bg-yellow-100 text-yellow-800"},
    };
    const loadUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUserById(userId);
            setUser(data);
            console.log(data)
            setNote("")
        } catch (err) {
            setError("Không thể tải chi tiết người dùng.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {

        if (userId) {
            loadUser();
        }
    }, [userId]);
    const handleBlock = async () => {
        if (!user) return
        try {
            setIsLoading(true);
            // Giả lập gọi API xóa
            const res = await blockUser(user.userId, note)
            console.log("Deleting user:", user.userId);
            await loadUser()

        } catch (error) {
            toast.error((error as Error).message ?? "Không thể khoá người dùng");
        } finally {
            setIsLoading(false);
        }
        // Cần thêm logic đóng drawer và reload bảng ở đây
    };
    const handleUnblock = async () => {
        if (!user) return
        try {

            setIsLoading(true);
            // Giả lập gọi API xóa
            const res = await unblockUser(user.userId, note)
            await loadUser()
            console.log("Unblock user:", user.userId);
        } catch (error) {
            toast.error((error as Error).message ?? "Không thể mở khoá người dùng");
        } finally {
            setIsLoading(false);
        }
        // Cần thêm logic đóng drawer và reload bảng ở đây
    };
    if (isLoading) {
        return <Card className="p-4 flex justify-center"><Loader2 className="animate-spin mr-2 h-5 w-5"/> Đang
            tải...</Card>;
    }

    if (error || !user) {
        return <Card
            className="p-4 border-red-400 bg-red-50 text-red-700">Lỗi: {error || "Không tìm thấy người dùng."}</Card>;
    }
    const reportSeverity = user.violationCount > 10 ? 'high' : user.violationCount > 5 ? 'medium' : 'low';

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2">
                        <AvatarImage src={user.avatar} className={"object-cover"}/>
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{user.displayName}</CardTitle>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <Badge variant={statusConfig[user.status].variant}
                           className={`capitalize ${statusConfig[user.status].className}`}>{statusConfig[user.status].label}</Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3">

                {/* Thông tin cơ bản */}
                <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4"/>
                    Email: <span className="ml-1 font-medium text-foreground">{user.email}</span>
                </div>

                {/* Thống kê báo cáo */}
                <div className="flex items-center text-sm">
                    <ShieldAlert className={`mr-2 h-4 w-4 ${
                        reportSeverity === 'high' ? 'text-red-600' :
                            reportSeverity === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                    }`}/>
                    Số lượng vi phạm: <span className={`ml-1 font-bold ${
                    reportSeverity === 'high' ? 'text-red-600' :
                        reportSeverity === 'medium' ? 'text-yellow-600' :
                            'text-foreground'
                }`}>{user.violationCount}</span>
                    {user.violationCount > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                            (Cần xem xét)
                        </span>
                    )}
                </div>

                {/* Phần dành cho hành động của Moderator (Tùy chọn) */}
                <div className="pt-4 border-t mt-4 flex flex-col justify-end gap-2">
                    {/* Nút Khóa/Mở khóa */}
                    {/* Giả định hàm blockUser và unblockUser có sẵn */}
                    <Input
                        placeholder="Ghi chú"
                        value={note}
                        onChange={(e)=> {setNote(e.target.value)}}
                        className="h-8 w-full"
                    />
                    <Button disabled={note.trim().length <= 0} className={"w-full"}
                            variant={user.status != "BLOCKED" ? "default" : "destructive"}
                            onClick={user.status != "BLOCKED" ? handleBlock : handleUnblock}>
                        {user.status == "BLOCKED" ? 'Mở Khóa' : 'Khóa Tài Khoản'}
                    </Button>

                </div>
            </CardContent>
        </Card>
    );
};