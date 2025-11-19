import {PostMedia} from "@/types/dtos/post";

export interface MessageRequest {
    conversationId: string;
    content: string;
    replyToId?: string;
    mediaFiles: File[];
}
export interface MessageResponse {
    id: string;
    conversationId: string;

    senderId: string;
    senderName: string;
    senderAvatar: string;

    replyToId: string;
    content: string;
    media: PostMedia[];

    createdAt: string;
    isRead: boolean;
    reactions: ReactItem[];
}
export interface ReactItem{
    userId: string;
    emoji: string;
}
export interface ConversationResquest {
    isGroup?: boolean;
    title?: string;
    media?: File;
    memberIds?: string[];
}
export interface ConversationParticipant{
    id: string;
    displayName: string;
    avatarUrl: string;
    role: string;
}
export interface ConversationResponse {
    id: string;
    lastMessage?: MessageResponse;
    group: boolean;
    title?: string;
    mediaUrl?: string;
    upadtedAt: string;
    participants: ConversationParticipant[];
}