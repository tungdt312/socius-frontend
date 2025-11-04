import {FriendshipStatus} from "@/constants/enum";

export interface UserResponse {
    id: string;
    displayName: string;
    avatarUrl: string;
    isActive: boolean;
    bio: string;
    favorites: string;
    dateOfBirth: string;
}

export interface FriendShipResponse {
    status: FriendshipStatus;
    senderId: string;
    receiverId: string;

}

export interface UserRelationResponse extends UserResponse {
    following: boolean;
    followedBy: boolean;
    friendship: FriendShipResponse;
}
