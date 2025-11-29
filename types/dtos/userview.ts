export interface UserViewResponse {
    id: string;
    displayName: string;
    avatarUrl: string;
    isActive: boolean;

    username: string;
    email: string;
    status: string;
    roles: string[];

    bio: string;
    favorites: string;
    dateOfBirth: string;
}
export interface UserViewRequest {
    displayName: string;
    status: string;
    roles: string[];
}
export interface StaffRequest {
    username: string;
    password: string;
    email: string;
    fullname: string;
    roleName: string;
}