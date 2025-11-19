"use client"
import React, {useEffect, useState} from 'react'
import {CommentResponse, PostResponse} from "@/types/dtos/post";
import {getPostById} from "@/services/postService";
import {toast} from "sonner";
import {DisablePost, getAccessIcon, PostBody, PostCardSkeleton, PostHeader} from "@/components/user/Post";
import {CommentInputForm} from "@/components/user/CommentForm";
import {postAccess, reactTargetType, reactType} from "@/constants/enum";
import {getPostsComments} from "@/services/commentService";
import {react} from "@/services/reactService";
import {Card, CardFooter, CardHeader} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import {formatISODate, formatNumber} from "@/lib/utils";
import PostEllipsis from "@/components/user/PostEllipsis";
import {Button} from "@/components/ui/button";
import {EllipsisVertical, Heart, MessageCircle, Share2, UserRound} from "lucide-react";
import PostForm from "@/components/user/PostForm";
import {CommentItem, CommentSkeleton} from "@/components/user/Comments";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

const PostDetail = ({postId, i}: { postId: string, i: string }) => {

    const [index, setIndex] = useState(i);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPost, setCurrentPost] = useState<PostResponse | undefined>();
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

    useEffect(() => {
        const FetchData = async () => {
            try {
                setIsLoading(true);
                const res = await getPostById(postId);
                setCurrentPost(res);
                setIsLoading(false);
            } catch (error) {
                toast.error((error as Error).message ?? "Lỗi khi load bài ")
            }
        }
        FetchData()
    }, [postId]);
    useEffect(() => {
        if (currentPost) {
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
    }, [currentPost?.id]);

    const handleLikePost = async () => {
        if (currentPost) {
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
    if (isLoading) {
        return <PostCardSkeleton/>;
    }
    if (currentPost)
        return (
            <Card className={`w-full max-w-xl mx-auto my-4 h-full`}>
                <CardHeader className="flex flex-row items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Link href={`/user/${currentPost.authorId}`}>
                            <Avatar className={"size-10"}>
                                <AvatarImage src={currentPost.authorAvatar} className={"object-cover"}/>
                                <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex flex-col">
                            <Link href={`/user/${currentPost.authorId}`} className="subtitle1 hover:underline">
                                {currentPost.authorName}
                            </Link>
                            <div className="flex items-center gap-1.5 caption text-muted-foreground">
                                <span>{formatISODate(currentPost.createdAt)}</span>
                                <span>·</span>
                                {getAccessIcon(currentPost.accessModifier)}
                            </div>
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
                <div className={"overflow-auto h-full"}>
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
                        <Button variant="ghost" size="sm" className={"flex items-center gap-1.5 text-muted-foreground"}
                                title={"Bình luận"}>
                            <MessageCircle
                                className={`size-5 text-muted-foreground`}/>
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
                    <div className="border-t border-border px-4 py-3 h-fit space-y-4">
                        <div className="gap-1 h-auto">
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

                    </div>
                </div>
                <CommentInputForm className={"px-4"} postId={currentPost.id} parent={parent}
                                  onCommentPosted={handleCommentPosted}
                                  onCancelReply={() => setParent(undefined)}/>
            </Card>
        );
}
export default PostDetail
