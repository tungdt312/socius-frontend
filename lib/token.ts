// lib/global.ts

import {UserResponse} from "@/types/apis/user";

// @ts-ignore
if (!globalThis.myGlobalState ) {
    // @ts-ignore
    globalThis.myGlobalState= {
        accessToken: null,
        refreshToken: null,
        owner: null,
    };
}

// @ts-ignore
export const globalState = globalThis.myGlobalState as {
    accessToken: string | null,
    refreshToken: string | null,
    owner: UserResponse | null,
};

export function setToken(access: string, refresh?: string) {
    globalState.accessToken = access;
    globalState.refreshToken = refresh?? null;
}
export function setOwner(owner: UserResponse) {
    globalState.owner = owner;
}
export function clearToken() {
    globalState.accessToken = null;
    globalState.refreshToken = null;
    globalState.owner = null;
}
