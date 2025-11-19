"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import {ACCESS_TOKEN_KEY} from "@/constants";
import {UserResponse} from "@/types/dtos/user";
import {getMe} from "@/services/userService";

// URL WebSocket của Spring Boot backend
const STOMP_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080/ws";

interface StompContextType {
    client: Client | null;
    isConnected: boolean;
}

const StompContext = createContext<StompContextType>({
    client: null,
    isConnected: false,
});

// Hook để component con sử dụng
export const useStomp = () => {
    return useContext(StompContext);
};
const initialFetch = async () => {
    const res = await getMe()
}
// Provider bọc toàn bộ ứng dụng của bạn
export const StompProvider = ({ children }: { children: React.ReactNode }) => {
    const [client, setClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);


    useEffect(() => {
        let stompClient: Client | null = null;

        const connectStomp = async () => {
            try {
                // (2) BƯỚC 1: "Kiểm tra" token bằng apiFetch
                // Nếu token hết hạn, apiFetch sẽ tự động refresh
                // trước khi đi tiếp.
                console.log("StompProvider: Đang xác thực token qua HTTP...");
                await initialFetch();

                // (3) BƯỚC 2: Lấy token (đã được làm mới)
                const token = localStorage.getItem(ACCESS_TOKEN_KEY);
                if (!token) {
                    throw new Error("Không tìm thấy token sau khi xác thực.");
                }

                // (4) BƯỚC 3: Xây dựng URL và kết nối STOMP
                const dynamicBrokerURL = `${STOMP_URL}?token=${token}`;

                stompClient = new Client({
                    brokerURL: dynamicBrokerURL,
                    reconnectDelay: 5000,
                    onConnect: () => {
                        setIsConnected(true);
                        console.log("STOMP đã kết nối!");
                    },
                    onDisconnect: () => {
                        setIsConnected(false);
                        console.log("STOMP đã ngắt kết nối.");
                    },
                    onStompError: (frame) => {
                        console.error('Lỗi STOMP: ' + frame.headers['message']);
                        console.error('Chi tiết: ' + frame.body);
                    },
                });

                stompClient.activate();
                setClient(stompClient);

            } catch (error) {
                // Nếu getSelf() thất bại (ví dụ: refresh token cũng hỏng)
                console.error("StompProvider: Xác thực HTTP thất bại, không thể kết nối STOMP.", error);
                // (Ở đây bạn có thể redirect về trang /sign-in)
            }
        };

        connectStomp();

        // (5) Dọn dẹp
        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, []);

    return (
        <StompContext.Provider value={{ client, isConnected }}>
            {children}
        </StompContext.Provider>
    );
};