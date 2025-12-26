"use client"
import React, {useEffect, useRef} from 'react'
import {useParams} from "next/navigation";
import {ZegoUIKitPrebuilt} from "@zegocloud/zego-uikit-prebuilt";
import {useCurrentUser, useCurrentUserId} from "@/components/userContext";
import {MessageRequest} from "@/types/dtos/message";
import {sendMessage} from "@/services/messageService";
import {toast} from "sonner";

const Page = () => {
    const {roomId} = useParams();
    const container = useRef<HTMLDivElement | null>(null);
    const user = useCurrentUser();

    const handleLeave = async () => {
        // Không gửi nếu không có gì
        try {
            // (4) TẠO REQUEST (Theo MessageRequest)
            const requestData: MessageRequest = {
                conversationId: roomId! as string,
                content: `${user.displayName} đã rời cuộc gọi`,
                replyToId: "", // (Tạm thời)
                mediaFiles: [], // Lấy mảng File
            };

            // (5) GỌI API HTTP
            await sendMessage(requestData);
        } catch (e) {
            toast.error("Gọi thất bại");
        }
    };

    useEffect(() => {
        if (!user?.id || user.id === "0" || !container.current) {
            console.log("Đang chờ thông tin user hợp lệ...", user?.id);
            return;
        }

        const userName = user.displayName || "unknown user";
        // 2. ÉP KIỂU: Luôn chuyển ID thành String để tránh lỗi Zego (như trong Hình 2 của bạn)
        const userId = String(user.id);

        console.log("Bắt đầu khởi tạo Zego với ID:", userId);
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!),
            process.env.NEXT_PUBLIC_ZEGO_APP_SIGN!,
            roomId as string,
            userId,
            userName,);
        console.log(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
        console.log(process.env.NEXT_PUBLIC_ZEGO_APP_SIGN)
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
            container: container.current!,
            turnOnCameraWhenJoining: false,
            showMyCameraToggleButton: false,
            showAudioVideoSettingsButton: false,
            showScreenSharingButton: false,
            showTextChat: false,
            showPreJoinView: false,
            scenario: {
                mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
            },
            onLeaveRoom: () => {
                handleLeave()
                // Add your custom logic
            }
        });

        return () => {
            zp.destroy();
        };

    }, [roomId, user?.id]);
    return (
        <div className="h-screen w-full flex justify-center items-center">
            {!user?.id || user.id === "0" ? (
                <div className="text-white bg-slate-800 p-4 rounded">
                    Đang xác thực tài khoản...
                </div>
            ) : (
                <div ref={container} className="w-full h-full"></div>
            )}
        </div>
    )
}
export default Page
