import React, {useEffect, useState} from 'react'
import {postAccess, reactTargetType, reactType} from "@/constants/enum";
import {
    ChevronLeft,
    ChevronRight,
    EllipsisVertical,
    Globe,
    Heart,
    Lock,
    MessageCircle,
    Share2,
    Users
} from "lucide-react";
import {CommentResponse, PostMedia, PostResponse} from "@/types/dtos/post";
import Link from "next/link";
import Image from "next/image";
import {formatISODate, formatNumber} from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton"; // Import Skeleton
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {CommentInputForm, useCurrentUserId} from "@/components/user/CommentForm";
import {CommentItem, CommentSkeleton} from "@/components/user/Comments";
import {ScrollArea} from "@/components/ui/scroll-area";
import {getPostsComments} from "@/services/commentService";
import PostForm, {PostEditForm} from "@/components/user/PostForm";
import {react} from "@/services/reactService";
import PostEllipsis from "@/components/user/PostEllipsis";

export function getAccessIcon(access: postAccess) {
    switch (access) {
        case postAccess.FRIENDS:
            return <Users className={"size-3 text-muted-foreground"}/>;
        case postAccess.PRIVATE:
            return <Lock className="size-3 text-muted-foreground"/>;
        case postAccess.PUBLIC:
        default:
            return <Globe className="size-3 text-muted-foreground"/>;
    }
}

export const DisablePost = () => (
    <Card className="w-full max-w-xl mx-auto my-4 h-fit overflow-hidden">
        <CardHeader className="flex flex-col items-center justify-between px-4">
            <p className={"subtitle1"}>Không thể hiển thị bài viết</p>
            <p className={"subtitle2 text-muted-foreground"}>Có thể người đăng bài đã gỡ bài hoặc bạn nằm ngoài đối
                tượng xem bài viết này</p>
        </CardHeader>
    </Card>
)
export const PostHeader = ({post}: { post: PostResponse }) => (
    <CardHeader className="flex flex-row items-center justify-between px-4">
        <div className="flex items-center gap-3">
            <Link href={`/user/${post.authorId}`}>
                <Image
                    alt="avatar"
                    src={post.authorAvatar || process.env.NEXT_PUBLIC_AVATAR_URL!}
                    height={40}
                    width={40}
                    className="size-10 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                />
            </Link>
            <div className="flex flex-col">
                <Link href={`/user/${post.authorId}`} className="subtitle1 hover:underline">
                    {post.authorName}
                </Link>
                <div className="flex items-center gap-1.5 caption text-muted-foreground">
                    <span>{formatISODate(post.createdAt)}</span>
                    <span>·</span>
                    {getAccessIcon(post.accessModifier)}
                </div>
            </div>
        </div>
    </CardHeader>
);
export const PostMediaShow = ({media}: { media: PostMedia[] }) => {
    const [index, setIndex] = useState(0);
    return (
        <div className={"w-full aspect-auto rounded-lg bg-accent relative"}>
            {media[index].type == "image" ? (
                <Image alt={"image"} width={576} height={576} src={media[index].url}
                       className={"max-h-[576px] w-full object-contain"}/>
            ) : (
                <video src={media[index].url} width={576} height={576} className={"max-h-[576px] w-full object-contain"}
                       autoPlay muted controls>
                    <span className={"caption text-muted-foreground"}>Trình duyệt không hỗ trợ định dạng video</span>
                </video>
            )}
            <span
                className={`text-muted-foreground caption bg-black/20 rounded-full p-1 absolute top-2 right-2 ${media.length == 1 ? "hidden" : ""}`}>{index + 1}/{media.length}</span>
            <Button variant={"ghost"} size={"icon-sm"}
                    className={`rounded-full absolute top-1/2 -translate-y-1/2 left-1 ${index == 0 ? "hidden" : ""}`}
                    onClick={() => setIndex(index - 1)}>
                <ChevronLeft size={24}/>
            </Button>
            <Button variant={"ghost"} size={"icon-sm"}
                    className={`rounded-full absolute top-1/2 -translate-y-1/2 right-1 ${index == media.length - 1 ? "hidden" : ""}`}
                    onClick={() => setIndex(index + 1)}>
                <ChevronRight size={24}/>
            </Button>

        </div>
    )
}
export const PostBody = ({post}: { post: PostResponse }) => (
    <CardContent className="p-0">
        {post.content && (
            <div className="px-4 pb-3 text-sm whitespace-pre-line">
                {post!.content}
            </div>
        )}
        {post.media && post.media.length > 0 && (
            <PostMediaShow media={post.media}/>
        )}
    </CardContent>
);
export const PostCard = ({post}: { post: PostResponse }) => {
    console.log(post);
    const [currentPost, setCurrentPost] = useState(post);
    const [isLiked, setIsLiked] = useState((currentPost?.reactSummary?.currentUserReact ?? "") == reactType.LOVE);
    const [likeCount, setLikeCount] = useState(currentPost?.reactCount ?? 0);
    const [showReplies, setShowReplies] = useState(false);
    const [page, setPage] = useState(0);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [commentCount, setCommentCount] = useState(currentPost?.commentCount ?? 0);
    const [shareCount, setShareCount] = useState(currentPost?.shareCount ?? 0);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [parent, setParent] = useState<CommentResponse | undefined>(undefined);
    const [isDelete, setIsDelete] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    if (!post) {
        return <DisablePost/>;
    }
    useEffect(() => {
        if (!showReplies) setComments([]);
        if (showReplies && currentPost.id && comments.length === 0) {
            const fetchComments = async () => {
                setIsLoadingComments(true);
                try {
                    const fetchedComments = await getPostsComments(currentPost.id);

                    setPage(page + 1);
                    setComments(comments.concat(fetchedComments.content ?? []));

                    console.log("Đang tải bình luận cho post " + currentPost.id);


                } catch (error) {
                    toast.error("Không thể tải bình luận");
                } finally {
                    setIsLoadingComments(false);
                }
            };
            fetchComments();
        }
    }, [showReplies, currentPost.id, comments.length, commentCount]);
    const handleLikePost = async () => {
        const newIsLiked = !isLiked;
        const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

        setIsLiked(newIsLiked);
        setLikeCount(newLikeCount);

        try {
            const res = await react({
                reactTypeId: (1).toString(),
                targetId: currentPost.id,
                targetType: reactTargetType.POST
            })
        } catch (error) {
            setIsLiked(!newIsLiked);
            setLikeCount(newLikeCount ? newLikeCount + 1 : newLikeCount - 1);
            toast.error("Thích thất bại");
        }
    };
    const handleCommentPosted = (newComment: CommentResponse) => {
        setComments(prevComments => [newComment, ...prevComments]);
        setCommentCount(commentCount + 1);
        setParent(undefined);
    };
    const handleDeletePost = async () => {
        setIsDelete(true);
    }
    const handlePostEdited = (updatedPost: PostResponse) => {
        setCurrentPost(updatedPost); // Cập nhật post
        toast.success("Đã cập nhật bài viết");
    };

    if (!currentPost) {
        return <PostCardSkeleton/>;
    }
    return (
        <Card className={`w-full max-w-xl mx-auto my-4 h-fit overflow-hidden ${(isDelete ? "hidden" : "")}`}>
            <CardHeader className="flex flex-row items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Link href={`/user/${currentPost.authorId}`}>
                        <Image
                            alt="avatar"
                            src={currentPost.authorAvatar || process.env.NEXT_PUBLIC_AVATAR_URL!}
                            height={40}
                            width={40}
                            className="size-10 object-cover rounded-full group-data-[state=on]:ring-primary-foreground group-data-[state=on]:ring-1"
                        />
                    </Link>
                    <div className="flex flex-col">
                        <Link href={`/user/${currentPost.authorId}`} className="subtitle1 hover:underline">
                            {currentPost.authorName}
                        </Link>
                        <Link href={`/post/${currentPost.id}`}
                              className="flex items-center gap-1.5 caption text-muted-foreground hover:underline">
                            <span>{formatISODate(currentPost.createdAt)}</span>
                            <span>·</span>
                            {getAccessIcon(currentPost.accessModifier)}
                        </Link>
                    </div>
                </div>
                <PostEllipsis post={currentPost} onDelete={handleDeletePost} onEditClick={(p) => {
                    setCurrentPost(p)
                }}>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <EllipsisVertical className="size-5"/>
                    </Button>
                </PostEllipsis>
            </CardHeader>
            <PostBody post={currentPost}/>
            {(currentPost.sharedPost?.id && currentPost.sharedPostId) && (
                <div className="mx-2 pt-2 sm:mx-4 mb-2 border border-border rounded-lg overflow-hidden">
                    <PostHeader post={currentPost.sharedPost}/>
                    <PostBody post={currentPost.sharedPost}/>
                </div>
            )}
            {(!currentPost.sharedPost?.id && currentPost.sharedPostId) && (
                <div className="mx-2 sm:mx-4">
                    <DisablePost/>
                </div>
            )}
            <CardFooter className="flex items-center justify-start px-3">
                <Button onClick={() => handleLikePost()} variant="ghost" size="sm"
                        className="flex items-center gap-1.5 text-muted-foreground" title={"Thích"}>
                    <Heart
                        className={`size-5 ${isLiked ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`}/>
                    {/*<span className={"text-[20px]"}>❤️</span>*/}
                    <span>{formatNumber(likeCount)}</span>
                </Button>
                <Button onClick={() => {
                    setShowReplies(!showReplies)
                }} variant="ghost" size="sm" className={"flex items-center gap-1.5 text-muted-foreground"}
                        title={"Bình luận"}>
                    <MessageCircle
                        className={`size-5 ${showReplies ? 'text-foreground fill-foreground' : 'text-muted-foreground'}`}/>
                    <span>{formatNumber(commentCount)}</span>
                </Button>
                {(currentPost.accessModifier == postAccess.PUBLIC) &&
                    <PostForm onPostCreated={() => setShareCount(shareCount + 1)} shareId={currentPost.id}>
                        <Button variant="ghost" size="sm"
                                className="flex items-center gap-1.5 text-muted-foreground"
                                title={"Chia sẻ"}>
                            <Share2 className="size-5"/>
                            <span>{formatNumber(shareCount)}</span>
                        </Button>
                    </PostForm>}
            </CardFooter>
            {showReplies && (
                <div className="border-t border-border px-4 py-3 h-fit space-y-4">
                    <div className="gap-1 h-auto max-h-[400px] overflow-auto">
                        {isLoadingComments && (
                            <>
                                <CommentSkeleton/>
                                <CommentSkeleton/>
                            </>
                        )}

                        {!isLoadingComments && comments.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Chưa có bình luận nào
                            </p>
                        )}
                        {!isLoadingComments && comments.map(comment => (
                            <CommentItem key={comment.id} comment={comment}
                                         onReplyClick={(cmt) => setParent(cmt)}/>
                        ))}
                    </div>
                    <CommentInputForm postId={post.id} parent={parent} onCommentPosted={handleCommentPosted}
                                      onCancelReply={() => setParent(undefined)}/>
                </div>
            )}
        </Card>
    );
};


export const PostCardSkeleton: React.FC = () => {
    return (
        <Card className="w-full max-w-xl mx-auto my-4">
            {/* Header Skeleton */}
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-11 rounded-full"/> {/* Avatar */}
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-32 rounded"/> {/* Author Name */}
                        <Skeleton className="h-3 w-24 rounded"/> {/* Date/Access */}
                    </div>
                </div>
                <Skeleton className="size-8 w-8 rounded-full"/> {/* More icon */}
            </CardHeader>

            {/* Body Skeleton */}
            <CardContent className="p-0">
                <div className="px-4 pb-3 space-y-2">
                    <Skeleton className="h-4 w-full rounded"/> {/* Content line 1 */}
                    <Skeleton className="h-4 w-11/12 rounded"/> {/* Content line 2 */}
                </div>
                <Skeleton className="w-full h-60 rounded-none"/> {/* Media area */}
            </CardContent>

            {/* Footer Skeleton */}
            <CardFooter className="flex items-center justify-between pt-4 px-4">
                <div className="flex items-center gap-1.5">
                    <Skeleton className="size-5 w-5 rounded"/> {/* Icon */}
                    <Skeleton className="h-4 w-12 rounded"/> {/* Count */}
                </div>
                <div className="flex items-center gap-1.5">
                    <Skeleton className="size-5 w-5 rounded"/> {/* Icon */}
                    <Skeleton className="h-4 w-12 rounded"/> {/* Count */}
                </div>
                <div className="flex items-center gap-1.5">
                    <Skeleton className="size-5 w-5 rounded"/> {/* Icon */}
                    <Skeleton className="h-4 w-12 rounded"/> {/* Count */}
                </div>
            </CardFooter>
        </Card>
    );
};