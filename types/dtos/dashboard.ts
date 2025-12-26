import {ReportableType} from "@/types/dtos/report";

export interface DashboardSummary {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    pendingReports: number;
    blockedContentCount: number;
}

export interface ModeratorSummary {
    totalAutoBanned: number;
    totalManualBanned: number;
    violationTypeDistribution: DashboardItem[]
}

export interface DashboardItem {
    label: string;
    value: number;
}

export interface StatsRequest {
    type: string;
    targetType: ReportableType;
    time: string;
}