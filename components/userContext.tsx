"use client"
import {useEffect, useState} from "react";
import {UserResponse} from "@/types/dtos/user";
import {USER_KEY} from "@/constants";

/**
 * Một hook nhỏ để lấy avatar của người dùng đang đăng nhập
 */
export const useCurrentUser = () => {
    const [user, setUser] = useState<UserResponse | null>(null);
    useEffect(() => {
        const data = localStorage.getItem(USER_KEY);
        if (data) {
            setUser(JSON.parse(data) as UserResponse);
        }
    }, []);
    return {...user};
};
export const useCurrentUserId = () => {
    const [id, setId] = useState<string | null>(null);
    useEffect(() => {
        const data = localStorage.getItem(USER_KEY);
        if (data) {
            setId(JSON.parse(data).id);
        }
    }, []);
    return {id};
};