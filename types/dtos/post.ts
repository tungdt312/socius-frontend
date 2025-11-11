import {Base} from "@/types/dtos/base";
import {postAccess, reactTargetType} from "@/constants/enum";

export interface PostMedia {
    type: string,
    url: string
}

export interface PostResponse {
    id: string;
    content: string;
    media: PostMedia[];
    accessModifier: postAccess;

    reactCount: number;
    commentCount: number;
    shareCount: number;

    authorName: string;
    authorAvatar: string;
    authorId: string;

    sharedPostId: string;
    sharedPost: PostResponse;

    createdAt: string;
    updatedAt: string;
    reactSummary: ReactSummary;
}

export interface PostRequest {
    content?: string;
    accessModifier?: postAccess;
    media?: File[];
}

export interface SharePostRequest {
    caption?: string;
    accessModifier?: postAccess;
    originalPostId: string;
}

export interface EditPostRequest {
    postId?: string;
    content?: string;
    accessModifier?: postAccess;
    keepMediaUrls?: string[];
    removeMediaUrls?: string[];
    media?: File[];
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
    mediaFile?: File;
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
    media: PostMedia[];
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