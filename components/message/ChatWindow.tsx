"use client";

import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
    addMember,
    delMember,
    editConversation,
    getConversationById,
    getConversationMessage, leaveConversation,
    sendMessage
} from '@/services/messageService'; // (1) Import hàm HTTP
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    Send,
    Smile,
    Paperclip,
    X,
    FileImage,
    LoaderCircle,
    ChevronLeft,
    EllipsisVertical,
    Edit,
    Plus, SquarePen, Camera, Trash2, LogOut, MessageCircle, User, UserRound
} from "lucide-react";
import {toast} from 'sonner';
import Image from 'next/image';
import {useStomp} from "@/components/StompContext";
import {useCurrentUser} from "@/components/user/CommentForm";
import {MessageItem} from "@/components/message/MessageItem"; // Để preview
import {ConversationResponse, ConversationResquest, MessageRequest, MessageResponse} from '@/types/dtos/message';
import {useRouter} from "next/navigation";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import MyEmojipicker from "@/components/ui/emojipicker";
import {EmojiClickData} from "emoji-picker-react";
import {hidden} from "next/dist/lib/picocolors";
import {Separator} from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {ConversationForm, FriendItem, MemberItem} from "@/components/message/ConversationForm";
import {UserRelationResponse} from "@/types/dtos/user";
import {getFriendsList} from "@/services/friendService";
import {load} from "next/dist/compiled/@edge-runtime/primitives/load";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

// (Giả sử bạn có hook này)
// import { useCurrentUser } from '@/hooks/useCurrentUser';

// (Type này dùng để xem trước file)
interface MediaPreview {
    file: File;
    url: string; // URL.createObjectURL()
}

// (Giả sử bạn có component MessageItem)
// import { MessageItem } from './MessageItem';

export const ChatWindow = ({conversationId}: { conversationId: string }) => {
    const {client, isConnected} = useStomp();
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [conversation, setConversation] = useState<ConversationResponse | undefined>(undefined)
    // (2) State mới để quản lý file
    const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const user = useCurrentUser();
    const MY_USER_ID = user?.id;

    const myRole = useMemo(() => {
        if (!conversation || !MY_USER_ID) return null;
        const me = conversation.participants.find(p => p.id === MY_USER_ID);
        return me?.role; // Giá trị ví dụ: 'OWNER', 'ADMIN', 'MEMBER'
    }, [conversation, MY_USER_ID]);

    // Kiểm tra xem mình có phải Owner không (Sửa chuỗi 'OWNER' tùy theo BE trả về)
    const amIOwner = myRole === 'OWNER';
    // 1. Tải tin nhắn cũ (HTTP)
    useEffect(() => {
        const fetchMessage = async () => {
            try {
                const conver = await getConversationById(conversationId);
                setConversation(conver);
                setMessages([]); // Xóa tin nhắn cũ
                const res = await getConversationMessage(conversationId);
                setMessages(res)
                console.log(`Đang tải tin nhắn cũ cho phòng ${conversationId}...`);
            } catch (e){
                toast.error((e as Error).message || "Tải tin nhắn thất bại");
            }
        }
        fetchMessage().then();
    }, [conversationId]);
    // 2. Lắng nghe tin nhắn mới (STOMP)
    useEffect(() => {
        if (client && isConnected && conversationId) {

            const destination = `/queue/conversation/${conversationId}`;

            const subscription = client.subscribe(destination, (message) => {
                try {
                    const newMsg = JSON.parse(message.body) as MessageResponse;
                    setMessages(prev => [newMsg,...prev]);

                } catch (e) {
                    console.error("Lỗi parse tin nhắn STOMP:", e);
                }
            });

            return () => subscription.unsubscribe();
        }
    }, [client, isConnected, conversationId]);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInput((prev) => prev + emojiData.emoji);
    };
    // 3. Xử lý File
    const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newPreviews: MediaPreview[] = files.map(file => ({
            file: file,
            url: URL.createObjectURL(file)
        }));

        setMediaPreviews(prev => [...prev, ...newPreviews]);
        e.target.value = ""; // Reset input
    };

    const handleFileDelete = (urlToRemove: string) => {
        const toDelete = mediaPreviews.find(p => p.url === urlToRemove);
        if (toDelete) {
            URL.revokeObjectURL(toDelete.url); // Dọn dẹp bộ nhớ
        }
        setMediaPreviews(prev => prev.filter(p => p.url !== urlToRemove));
    };
    // 4. Gửi tin nhắn (HTTP)
    const handleSend = async () => {
        // Không gửi nếu không có gì
        if (!input.trim() && mediaPreviews.length === 0) return;

        setIsSending(true);
        try {
            // (4) TẠO REQUEST (Theo MessageRequest)
            const requestData: MessageRequest = {
                conversationId: conversationId,
                content: input,
                replyToId: "", // (Tạm thời)
                mediaFiles: mediaPreviews.map(p => p.file), // Lấy mảng File
            };

            // (5) GỌI API HTTP
            await sendMessage(requestData);
            setInput("");
            mediaPreviews.forEach(p => URL.revokeObjectURL(p.url)); // Dọn dẹp
            setMediaPreviews([]);
        } catch (e) {
            toast.error("Gửi tin nhắn thất bại");
        } finally {
            setIsSending(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !conversation) return;

        const toastId = toast.loading("Đang cập nhật ảnh nhóm...");
        try {
            // Ép kiểu file thành any vì DTO media là string nhưng FormData nhận File
            const req: ConversationResquest = {media: file};
            const updatedConver = await editConversation(conversationId, req);
            setConversation(updatedConver);
            toast.success("Đã cập nhật ảnh", { id: toastId });
        } catch (error) {
            toast.error("Lỗi cập nhật ảnh", { id: toastId });
        } finally {
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        }
    };
    // 2. Đổi Tên Nhóm
    const handleRenameGroup = async () => {
        if (!conversation || !newGroupName.trim()) return;
        setIsRenaming(true);
        try {
            const updatedConver = await editConversation(conversation.id, {
                title: newGroupName
            });
            setConversation(updatedConver);
            toast.success("Đổi tên nhóm thành công");
        } catch (error) {
            toast.error("Đổi tên thất bại");
        } finally {
            setIsRenaming(false);
        }
    };
    // 3. Xóa Thành Viên (Chỉ Owner)
    const handleRemoveMember = async (memberId: string) => {
        if (!conversation) return;
        try {
            await delMember(conversation.id, memberId);
            // Update Local State: Filter bỏ người vừa xóa khỏi participants
            const updatedParticipants = conversation.participants.filter(p => p.id !== memberId);
            setConversation({ ...conversation, participants: updatedParticipants });
            toast.success("Đã mời thành viên ra khỏi nhóm");
        } catch (error) {
            toast.error("Không thể xóa thành viên");
        }
    };
    // 4. Rời nhóm
    const handleLeaveGroup = async () => {
        if(!conversation) return;
        try {
            await leaveConversation(conversation.id);
            toast.success("Đã rời nhóm");
            router.push("/message"); // Redirect ra ngoài
        } catch (error) {
            toast.error("Lỗi khi rời nhóm");
        }
    }
    return (
        <div className={`flex w-full h-screen`}>
            <div className={`flex-1 flex-col h-full w-full ${!showDetail ? "flex" : "hidden"} lg:flex`}>
                <div className=" flex justify-between p-3 border-b border-border">
                    <div className={"flex items-center gap-3 w-fit"}>
                        <ChevronLeft size={24} className={"lg:hidden block cursor-pointer"}
                                     onClick={() => router.push("/message")}/>
                        <Avatar className={"size-8"}>
                            <AvatarImage src={conversation?.mediaUrl} className={"object-cover"}/>
                            <AvatarFallback><MessageCircle  size={"80%"}/></AvatarFallback>
                        </Avatar>
                        <p className={"truncate w-full overflow-ellipsis"}>{conversation?.title || "Cuộc trò chuyện"}</p>
                    </div>
                    <div className={"flex items-center gap-3"}>
                        <EllipsisVertical className={"cursor-pointer"} size={24} onClick={() => setShowDetail(true)}/>
                    </div>
                </div>
                {/* Vùng tin nhắn */}
                <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden flex flex-col-reverse gap-4">
                        {(!messages || messages.length === 0) && (
                            <div className={"flex flex-col w-full flex-1 items-center justify-center"}>
                                <p className={"heading4"}>Chưa có tin nhắn nào</p>
                                <p>Gửi ảnh và tin nhắn cho bạn bè của bạn</p>
                            </div>
                        )}
                        {messages.reverse().map((msg) => (
                            <MessageItem
                                key={msg.id}
                                message={msg}
                                isMe={msg.senderId === MY_USER_ID}
                            />
                        ))}

                </div>

                {/* Vùng xem trước file (Mới) */}
                {mediaPreviews.length > 0 && (
                    <div className="flex gap-2 p-3 rounded-t-lg rounded-r-lg border-1 border-border overflow-x-auto">
                        {mediaPreviews.map((preview) => (
                            <div key={preview.url} className="relative shrink-0">
                                <Image
                                    src={preview.url}
                                    alt="preview"
                                    width={80} height={80}
                                    className="h-20 w-20 object-cover rounded"
                                />
                                <Button
                                    variant="destructive" size="icon"
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                                    onClick={() => handleFileDelete(preview.url)}
                                >
                                    <X className="h-3 w-3"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Vùng nhập liệu (Đã sửa) */}
                <form
                    className="flex items-center gap-2 p-3 rounded-t-lg rounded-r-lg border-1 border-border"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend().then();
                    }}
                >
                    {/* Input file ẩn (hỗ trợ 'multiple') */}
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileAdd}
                        ref={fileInputRef}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-green-500"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FileImage size={24}/>
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon"><Smile size={24}/></Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 border-0 w-[250px]">
                            <MyEmojipicker onEmojiClick={onEmojiClick}/>
                        </PopoverContent>
                    </Popover>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Nhắn tin..."
                        autoComplete="off"
                        disabled={isSending}
                    />
                    <Button className={"aspect-square rounded-full"} type="submit" disabled={!isConnected || isSending}>
                        {isSending ? <LoaderCircle className={"animate-spin"}/> : <Send/>}
                    </Button>
                </form>
            </div>
            <div className={`flex-col items-center border-l-1 border-border flex-1 lg:w-1/3 ${showDetail ? "flex" : "hidden"}`}>
                <div className={"flex flex-col w-full items-end gap-3"}>
                    <Button variant="ghost" size="icon" onClick={() => setShowDetail(false)}><X /></Button>
                </div>

                <div className="flex-1 w-full overflow-auto">
                    <div className="p-4 flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => {
                            if (amIOwner) avatarInputRef.current?.click()
                        }}>
                            <Avatar className={"size-30"}>
                                <AvatarImage src={conversation?.mediaUrl} className={"object-cover"}/>
                                <AvatarFallback><MessageCircle  size={"80%"}/></AvatarFallback>
                            </Avatar>
                            <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20 rounded-full ${amIOwner ?"":"hidden"} `}>
                                <Camera className="text-white" size={32} />
                            </div>
                            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </div>

                        {/* 2. Title - Edit Name */}
                        <div className="flex items-center gap-2 w-full justify-center">
                            <p className="text-lg font-semibold truncate">{conversation?.title || "Nhóm chưa đặt tên"}</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className={`size-8 ${amIOwner ? "": "hidden"}`}><Edit size={16}/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Đổi tên nhóm</AlertDialogTitle>
                                        <AlertDialogDescription>Tên nhóm sẽ hiển thị với tất cả thành viên.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Tên nhóm mới" />
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleRenameGroup} disabled={isRenaming}>
                                            {isRenaming ? "Đang lưu..." : "Lưu"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        <Separator />

                        {/* 3. Members List */}
                        <div className={`w-full space-y-3 ${conversation?.group ? "": "hidden"}`}>
                            <div className="flex justify-between items-center">
                                <p className="font-medium text-sm text-muted-foreground">Thành viên ({conversation?.participants?.length || 0})</p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className={`h-8 rounded-full gap-1 ${amIOwner ? "":"hidden"}`}><Plus size={16}/> Thêm</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Thêm thành viên</AlertDialogTitle></AlertDialogHeader>
                                        {conversation && <AddMems conversation={conversation} onSuccess={c => setConversation(c)} />}
                                        <AlertDialogFooter><AlertDialogCancel>Đóng</AlertDialogCancel></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            {/* List rendering based on Participants DTO */}
                            <div className="flex flex-col gap-2">
                                {conversation?.participants?.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Avatar className={"size-8"}>
                                                <AvatarImage src={member.avatarUrl} className={"object-cover"}/>
                                                <AvatarFallback><UserRound  size={"80%"}/></AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col truncate">
                                                <span className="text-sm font-medium truncate">{member.displayName}</span>
                                                {/* Hiển thị label nếu là Owner - Cần logic backend */}
                                                {member.role === "OWNER" && <span className="text-[10px] text-primary font-bold">Trưởng nhóm</span>}
                                            </div>
                                        </div>

                                        {/* Button Xóa: Chỉ hiện nếu mình là Owner và không xóa chính mình */}
                                        {amIOwner && member.id !== MY_USER_ID && (
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8"
                                                    onClick={() => handleRemoveMember(member.id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`p-4 border-t border-border w-full ${conversation?.group ? "": "hidden"}`}>
                    <Button variant="destructive" className="w-full gap-2" onClick={handleLeaveGroup}>
                        <LogOut size={18} /> Rời nhóm
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Component AddMems (cập nhật type cho khớp)
const AddMems = ({ conversation, onSuccess }: { conversation: ConversationResponse, onSuccess: (c: ConversationResponse) => void }) => {
    const [search, setSearch] = useState("");
    const [friends, setFriends] = useState<UserRelationResponse[]>([]);
    const [members, setMembers] = useState<UserRelationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingFriends, setLoadingFriends] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setLoadingFriends(true);
                const res = await getFriendsList();
                setFriends(res.content ?? []);
            } catch { toast.error("Lỗi tải danh sách bạn bè"); }
            finally { setLoadingFriends(false); }
        }
        fetchFriends().then();
    }, []);

    const handleAdd = async () => {
        try {
            setIsLoading(true);
            const res = await addMember(conversation.id, members.map(m => m.id));
            toast.success("Đã thêm thành viên");
            onSuccess(res);
            setMembers([]);
        } catch { toast.error("Lỗi thêm thành viên"); }
        finally { setIsLoading(false); }
    }

    // Lọc bạn bè: Chỉ hiện người chưa có trong nhóm (dựa vào participants)
    const filteredFriends = friends.filter(f =>
        f.displayName.toLowerCase().includes(search.toLowerCase()) &&
        !conversation.participants.some(p => p.id === f.id)
    );

    return (
        <div className="flex flex-col gap-4 h-[400px]">
            <Input placeholder="Tìm bạn bè..." value={search} onChange={e => setSearch(e.target.value)} />

            {members.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {members.map(m => (
                        <MemberItem key={m.id} member={m} onRemove={() => setMembers(prev => prev.filter(x => x.id !== m.id))} />
                    ))}
                </div>
            )}

            <div className="flex-1 border rounded-md p-2 overflow-auto">
                {loadingFriends ? <div className="text-center p-4"><LoaderCircle className="animate-spin mx-auto"/></div> :
                    filteredFriends.length === 0 ? <p className="text-center text-muted-foreground p-4">Không tìm thấy</p> :
                        filteredFriends.map(friend => (
                            <FriendItem key={friend.id} friend={friend} onSelect={() => !members.find(m => m.id === friend.id) && setMembers([...members, friend])} />
                        ))}
            </div>

            <Button onClick={handleAdd} disabled={isLoading || members.length === 0} className="w-full">
                {isLoading && <LoaderCircle className="animate-spin mr-2"/>} Thêm vào nhóm
            </Button>
        </div>
    );
}