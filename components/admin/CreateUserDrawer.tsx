"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Eye, EyeOff, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Import hàm API của bạn (giả sử đường dẫn)
import { createStaff } from "@/services/userviewService";
import {StaffRequest} from "@/types/dtos/userview";

// --- 1. Định nghĩa Schema Validation (Zod) ---
const formSchema = z.object({
    username: z.string().min(3, { message: "Username phải có ít nhất 3 ký tự." }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
    email: z.email({ message: "Email không hợp lệ." }),
    fullname: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự." }),
    roleName: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

// --- 2. Component Drawer ---
interface CreateUserDrawerProps {
    onSuccess?: () => void; // Hàm gọi lại để refresh bảng sau khi tạo xong
}

export function CreateUserDrawer({ onSuccess }: CreateUserDrawerProps) {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    // Khởi tạo form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            email: "",
            fullname: "",
            roleName: "",
        },
    });

    // Hàm xử lý Submit
    async function onSubmit(values: FormValues) {
        setIsLoading(true);
        try {
            // Mapping dữ liệu từ form sang interface StaffRequest
            const req: StaffRequest = {
                username: values.username,
                password: values.password,
                email: values.email,
                fullname: values.fullname,
                roleName: values.roleName,
            };

            // Gọi API (Tham số id thứ 2 tôi để rỗng tạm thời vì trong hàm bạn gửi không thấy dùng tới biến id)
            await createStaff(req);

            toast.success("Tạo người dùng mới thành công!");
            form.reset(); // Reset form về rỗng
            setOpen(false); // Đóng drawer
            onSuccess?.(); // Refresh lại bảng dữ liệu bên ngoài
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tạo người dùng. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                <Button size="sm">
                    <Plus className=" size-4" /> <span className={"hidden ml-2 lg:block"}>Thêm</span>
                </Button>
            </DrawerTrigger>

            {/* Chỉnh lại class CSS để Drawer hiển thị bên phải như Sidebar */}
            <DrawerContent className=" text-foreground h-full max-h-[90vh] md:max-h-full md:w-[450px] md:ml-auto rounded-none md:rounded-l-xl flex flex-col">
                <DrawerHeader className="border-b pb-4">
                    <DrawerTitle>Thêm người dùng mới</DrawerTitle>
                    <DrawerDescription>
                        Điền thông tin để tạo tài khoản người dùng mới vào hệ thống.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <Form {...form}>
                        <form id="create-user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Fullname Field */}
                            <FormField
                                control={form.control}
                                name="fullname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Họ và tên</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nguyễn Văn A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Username Field */}
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên tài khoản (Username)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="nguyenvana" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="example@gmail.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="******"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Role Select Field */}
                            <FormField
                                control={form.control}
                                name="roleName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vai trò</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn vai trò" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ADMIN">Quản trị viên (Admin)</SelectItem>
                                                <SelectItem value="MODERATOR">Kiểm duyệt viên (Modderator)</SelectItem>
                                                <SelectItem value="USER">Người dùng (User)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>

                <DrawerFooter className="border-t pt-4">
                    <Button type="submit" form="create-user-form" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? "Đang tạo..." : "Tạo mới"}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Hủy bỏ</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}