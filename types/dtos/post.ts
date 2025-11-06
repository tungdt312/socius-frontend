import {Base} from "@/types/dtos/base";
import {postAccess, reactTargetType} from "@/constants/enum";

export interface PostResponse {
    id: string;
    content: string;
    mediaUrl: string;
    accessModifier: postAccess;

    reactCount: number;
    commentCount: number;
    shareCount: number;

    authorName: string;
    authorAvatar: string;
    authorId: string;
    sharedPost: PostResponse;
    createdAt: string;
    updatedAt: string;
    reactSummary: ReactSummary;
}

export interface PostRequest {
    content?: string;
    accessModifier?: postAccess;
    sharedPostId?: string;
    media?: File;
}

export interface CommentRequest {
    postId?: string;
    parentId?: string;
    content?: string;
    mediaFile?: File
}
export interface EditCommentRequest {
    commentId?: string;
    content?: string;
    imageFile?: File;
    removeImage: boolean;
}
export interface CommentResponse {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    postId: string;
    parentId: string;
    content: string;
    mediaUrl: string;
    reactCount: number;
    childrenCount: number;
    createdAt: string;
    updatedAt: string;
    depth: number;
    reactSummary: ReactSummary;
}

export interface ReactRequest {
    targetId: string;
    targetType:reactTargetType,
    reactTypeId: string;
}

export interface ReactSummary{
    currentUserReact: string;
}