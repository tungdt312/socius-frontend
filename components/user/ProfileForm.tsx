"use client"
import React from "react";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {globalState} from "@/lib/token";
import {toast} from "sonner";
import {BASE} from "@/lib/utils";

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
    const initialUser = globalState.owner
    console.log("initialUser", initialUser?.bio)
    const [displayName, setDisplayName] = React.useState(initialUser?.displayName ?? "");
    const [bio, setBio] = React.useState(initialUser?.bio ??"");
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(initialUser?.avatarUrl || null);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (!avatarFile) return;
        const url = URL.createObjectURL(avatarFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [avatarFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("Loại file này không được hỗ trợ. Hãy thử lại với PNG/JPEG/WEBP.");
            return;
        }
        if (file.size > MAX_AVATAR_SIZE) {
            setError("Ảnh đại diện quá lớn. Dung lượng tối đa là 2MB.");
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
                const res = await fetch(`${BASE}/api/user/me`, {
                    method: "PUT",
                    body: form,
                });
                if (!res.ok) {
                    const text = await res.text();
                    toast.error(text || "Lưu trang cá nhân thất bại");
                }
        } catch (err: any) {
            setError(err?.message || "Lưu trang cá nhân thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
            <FieldGroup>
                <FieldSet>
                    <Field orientation={"vertical"}>
                        <FieldLabel>Ảnh đại diện</FieldLabel>
                        <div className="flex flex-col md:flex-row items-center justify-between rounded-2xl bg-accent p-4 gap-2">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="avatar preview" className="object-cover" width={80} height={80} />
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

            {error && <div className="text-sm text-red-600 mt-3">{error}</div>}

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
