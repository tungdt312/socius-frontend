export interface NotificationResponse{
    id: string,
    actor:{
        id: string,
        displayName:string,
        avatarUrl:string,
    },
    content: string,
    link: string,
    createdAt: string,
    read: boolean,
}