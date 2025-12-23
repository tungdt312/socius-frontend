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
    violationTypeDistribution: Item[]
}

export interface Item {
    label: string;
    value: number;
}