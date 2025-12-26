import {ReportableType} from "@/types/dtos/report";
import {PostMedia} from "@/types/dtos/post";
import {AccountStatus} from "@/constants/enum";

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
    violationCount: number,
    status: AccountStatus,
}

export interface ModeratorMessage {
    id: string,
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    content: string,
    sentAt: string,
    media: PostMedia[],
    deletedAt: string,
}