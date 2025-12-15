import {ReportableType} from "@/types/dtos/report";

export interface ModerationResult {
    isToxic: boolean,
    reason: string,
}

export interface ModeratorLog {
    id: string,
    targetType: ReportableType,
    targetId: string,
    action: string,
    reason: string,

    actorId: string,
    actorName: string,
    actorAvatar: string,

    createdAt: string,
}

export interface ModeratorUser {
    userId: string,
    username: string,
    displayName: string,
    avatar: string,
    email: string,
    reportCount: number,
    locked: boolean,
}

export interface ModeratorUser {
    userId: string,
    username: string,
    displayName: string,
    avatar: string,
    email: string,
    reportCount: number,
    locked: boolean,
}

export interface ModeratorMessage {
    id: string,
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    content: string,
    sentAt: string,
    mediaUrls: string[],
}