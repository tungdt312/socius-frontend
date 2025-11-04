"use client"
import React, {useEffect, useState} from "react";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {toast} from "sonner";
import {putMe} from "@/services/userService";
import {USER_KEY} from "@/constants";
import {UserResponse} from "@/types/dtos/user";

interface ProfileFormProps {
    initialDisplayName?: string;
    initialBio?: string;
    initialAvatarUrl?: string;
    onSave?: (data: FormData) => Promise<void>;
    onCancel?: () => void;
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const ProfileForm = () => {
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Dùng null
    const [isLoadingData, setIsLoadingData] = useState(true); // State cho lần tải đầu

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // State cho lúc submit

    // useEffect này chỉ dùng để tải dữ liệu LẦN ĐẦU
    useEffect(() => {
        const data = localStorage.getItem(USER_KEY);
        if (data) {
            const user: UserResponse = JSON.parse(data); // Parse trong useEffect
            setBio(user.bio);
            setDisplayName(user.displayName);
            setPreviewUrl(user.avatarUrl); // Set URL ban đầu
        }
        setIsLoadingData(false); // Đánh dấu đã tải xong
    },[]);


    useEffect(() => {
        if (!avatarFile) return;
        const url = URL.createObjectURL(avatarFile);
        setPreviewUrl(url); // Ghi đè preview
        return () => URL.revokeObjectURL(url);
    }, [avatarFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setError(null);
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error("Loại file này không được hỗ trợ. Hãy thử lại với PNG/JPEG/WEBP.");
            return;
        }
        if (file.size > MAX_AVATAR_SIZE) {
            toast.error("Ảnh đại diện quá lớn. Dung lượng tối đa là 2MB.");
            return;
        }
        setAvatarFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!displayName.trim()) {
            setError("Tên hiển thị không được trống");
            return;
        }

        const form = new FormData();
        form.append("displayName", displayName.trim());
        form.append("bio", bio);
        if (avatarFile) {
            form.append("avatarFile", avatarFile);
        }
        setLoading(true);
        try {
            const updatedUser: UserResponse = await putMe(form);

            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            setPreviewUrl(updatedUser.avatarUrl);
            setAvatarFile(null);
            toast.success("Lưu trang cá nhân thành công");
        } catch (error) {
            setError((error as Error).message ?? "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    };

    if (isLoadingData) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
            <FieldGroup>
                <FieldSet>
                    <Field orientation={"vertical"}>
                        <FieldLabel>Ảnh đại diện</FieldLabel>
                        <div
                            className="flex flex-col md:flex-row items-center justify-between rounded-2xl bg-accent p-4 gap-2">
                            <div
                                className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">

                                {previewUrl ? ( // 6. Sửa: Chỉ cần check truthy
                                    <Image
                                        src={previewUrl || process.env.NEXT_PUBLIC_AVATAR_URL!}
                                        alt="avatar preview"
                                        className="object-cover"
                                        width={80}
                                        height={80}
                                    />
                                ) : (
                                    <div className="text-sm text-gray-400">No avatar</div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    aria-label="Chọn ảnh đại diện"
                                />
                                <div className="subtitle2 text-gray-500">PNG, JPEG, WEBP — max 2MB</div>
                            </div>
                        </div>
                    </Field>
                    <Field orientation={"vertical"}>
                        <FieldLabel>Tên hiển thị</FieldLabel>
                        <Input
                            value={displayName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                            placeholder="Điền tên hiển thị"
                            aria-label="Display name"
                            className="w-full"
                        />
                    </Field>
                    <Field orientation={"vertical"}>
                        <FieldLabel>Giới thiệu</FieldLabel>
                        <Textarea
                            value={bio}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                            placeholder="Giới thiệu"
                            rows={7}
                            aria-label="Bio"
                            className="w-full max-w-[600px]"
                        />
                    </Field>
                </FieldSet>
            </FieldGroup>
            <div className="mt-4 flex justify-end gap-2">
                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Đang lưu..." : "Lưu"}
                </Button>
            </div>
        </form>
    );
};

export default ProfileForm;
