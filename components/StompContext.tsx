"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { ACCESS_TOKEN_KEY } from "@/constants";
import { getMe } from "@/services/userService";

const STOMP_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080/ws";

interface StompContextType {
    client: Client | null;
    isConnected: boolean;
}

const StompContext = createContext<StompContextType>({
    client: null,
    isConnected: false,
});

export const useStomp = () => useContext(StompContext);

export const StompProvider = ({ children }: { children: React.ReactNode }) => {
    const [client, setClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // useRef để giữ kết nối không bị reset khi component re-render
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // Cờ kiểm tra xem component còn mount không (để tránh set state khi đã unmount)
        let isMounted = true;

        const initStomp = async () => {
            try {
                // 1. Nếu đã có client đang chạy thì không tạo lại (Fix Strict Mode)
                if (clientRef.current?.active) return;

                console.log("StompProvider: Đang xác thực token...");
                await getMe(); // Kiểm tra/Refresh token

                // Nếu trong lúc chờ await mà component bị unmount thì dừng lại
                if (!isMounted) return;

                const token = localStorage.getItem(ACCESS_TOKEN_KEY);
                if (!token) return;

                // 2. Cấu hình Client
                const stompClient = new Client({
                    // Sử dụng webSocketFactory để đảm bảo mỗi lần reconnect (nếu rớt mạng)
                    // nó sẽ lấy token mới nhất từ localStorage thay vì dùng token cũ
                    webSocketFactory: () => {
                        const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY);
                        return new WebSocket(`${STOMP_URL}?token=${currentToken}`);
                    },
                    reconnectDelay: 5000, // Tự động kết nối lại sau 5s
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    onConnect: () => {
                        if (isMounted) {
                            setIsConnected(true);
                            console.log("🟢 STOMP Connected");
                        }
                    },
                    onDisconnect: () => {
                        if (isMounted) {
                            setIsConnected(false);
                            console.log("🔴 STOMP Disconnected");
                        }
                    },
                    onStompError: (frame) => {
                        console.error('Lỗi STOMP:', frame.headers['message']);
                    },
                });

                // 3. Kích hoạt và lưu vào ref/state
                stompClient.activate();
                clientRef.current = stompClient;
                setClient(stompClient);

            } catch (error) {
                console.error("Lỗi khởi tạo STOMP:", error);
            }
        };

        initStomp();

        // 4. CLEANUP FUNCTION (Quan trọng nhất)
        return () => {
            isMounted = false; // Đánh dấu đã unmount
            if (clientRef.current) {
                console.log("StompProvider: Cleaning up connection...");
                clientRef.current.deactivate(); // Ngắt kết nối ngay lập tức
                clientRef.current = null;
            }
        };
    }, []);

    return (
        <StompContext.Provider value={{ client, isConnected }}>
            {children}
        </StompContext.Provider>
    );
};