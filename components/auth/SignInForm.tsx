"use client"

import React from 'react'
import {Card, CardContent} from "@/components/ui/card";
import {Input} from '../ui/input';
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet,} from "@/components/ui/field"
import {Button} from "@/components/ui/button";
import {EyeClosed, EyeIcon, LoaderCircle} from "lucide-react";
import ForgetPasswordForm from "@/components/auth/ForgetPasswordForm";
import {useRouter} from "next/navigation";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {signInSchema} from "@/schema/authSchema";
import {AccountStatus} from "@/constants/enum";
import OTPModal from "@/components/auth/OTPModal";
import { LoginRequest, LoginResponse} from "@/types/dtos/auth";
import {login, sendVerifyEmail} from "@/services/authService";
import {ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, USER_ROLE_KEY} from "@/constants";
import {getMe} from "@/services/userService";
import {RoleType, useRole} from "@/components/RoleContext";

const SignInForm = () => {
    const router = useRouter()

    const {switchRole} = useRole()
    const [showPassword, setShowPassword] = React.useState(false);
    const [isForgotPassword, setIsForgotPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const [email, setEmail] = React.useState("");

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof signInSchema>) => {
        setIsLoading(true);
        try {
            //Gui thông tin
            const req: LoginRequest = {
                username: values.username,
                password: values.password,
            }
            const data = await login(req);
            console.log(data);
            localStorage.setItem(ACCESS_TOKEN_KEY, data.token.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, data.token.refreshToken);
            localStorage.setItem(USER_ROLE_KEY, JSON.stringify(data.roles))
            const me = await getMe()
            localStorage.setItem(USER_KEY, JSON.stringify(me))
            const roles = data.roles || []; // Giả sử roles là mảng string ["ADMIN", "USER"]
            if (data) {
                switchRole(roles[0] as RoleType)
                if (data.status != AccountStatus.BLOCKED && data.status != AccountStatus.PENDING) {
                    toast.success("Đăng nhập thành công.")
                    if (roles[0] == "ADMIN") {
                        router.push("/admin"); // Chuyển trang Admin
                    } else if (roles[0] == "MODERATOR") {
                        router.push("/moderator"); // Chuyển trang Seller (nếu có)
                    } else {
                        router.push("/"); // Mặc định về trang chủ
                    }
                } else if (data.status == AccountStatus.BLOCKED) {
                    toast.warning("Tài khoản đã bị hạn chế một số chức năng. Liên hệ hỗ trợ để biết thêm chi tiết.")
                    if (roles[0] == "ADMIN") {
                        router.push("/admin"); // Chuyển trang Admin
                    } else if (roles[0] == "MODERATOR") {
                        router.push("/moderator"); // Chuyển trang Seller (nếu có)
                    } else {
                        router.push("/"); // Mặc định về trang chủ
                    }
                } else if (data.status == AccountStatus.PENDING) {
                    toast.error("Tài khoản chưa xác thực email. Vui lòng xác thực", {
                        action: {
                            label: "Gửi mail",
                            onClick: async () => {
                                const sendEmail = sendVerifyEmail({email})
                                toast.success("Email xác thực đã được gửi.");
                                setEmail(data.email);
                                setIsOpen(true);
                            }
                        }
                    })

                } else {
                    toast.error("Người dùng không xác định!")
                }
            }
        } catch (error: unknown) {
            toast.error((error as Error).message ??"Lỗi không xác định!");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <>
            <Card className={"w-full min-w-[350px]"}>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-4"}>
                        <FieldSet>
                            <FieldGroup>
                                <Field orientation={"responsive"}>
                                    <FieldLabel htmlFor="username">Tên đăng nhập</FieldLabel>
                                    <Input id="username" type="text"
                                           placeholder="Tên đăng nhập" {...form.register("username")} />
                                    {form.formState.errors.username && (
                                        <FieldError>
                                            {form.formState.errors.username.message}
                                        </FieldError>
                                    )}
                                </Field>
                                <Field orientation={"responsive"}>
                                    <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                                    <div className={"flex items-center w-full space-x-2"}>
                                        <Input id="password" type={showPassword ? "text" : "password"}
                                               placeholder="Mật khẩu"  {...form.register("password")}/>
                                        <Button type={"button"} className={"rounded-full size-8 transition-all"}
                                                variant={showPassword ? "default" : "outline"}
                                                onClick={() => setShowPassword(!showPassword)}>
                                            {
                                                showPassword
                                                    ? <EyeIcon size={24}/>
                                                    : <EyeClosed size={24}/>
                                            }
                                        </Button>
                                    </div>
                                    {form.formState.errors.password && (
                                        <FieldError>
                                            {form.formState.errors.password.message}
                                        </FieldError>
                                    )}
                                    <FieldDescription>
                                        <Button className={"p-0"} variant={"link"} type={"button"}
                                                onClick={() => setIsForgotPassword(true)}>
                                            Quên mật khẩu?
                                        </Button>
                                    </FieldDescription>

                                </Field>
                            </FieldGroup>
                        </FieldSet>
                        <div className={"flex items-center justify-center w-full"}>
                            <Button type="submit" className={"w-full"} disabled={isLoading}>
                                {isLoading && (
                                    <LoaderCircle className={"mr-1 size-5 animate-spin"}/>
                                )}
                                Đăng nhập
                            </Button>
                        </div>
                    </form>
                    <div className="w-full max-w-md flex items-center justify-center space-x-1 subtitle2">
                        <p>Chưa có tài khoản?</p>
                        <Button className={"p-0"} variant={"link"} type={"button"}
                                onClick={() => router.push("/sign-up")}>
                            Đăng ký ngay
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {isForgotPassword && (<ForgetPasswordForm onClose={() => setIsForgotPassword(false)}/>)}
            {isOpen && (<OTPModal type={"verifyEmail"} email={email} onClose={() => {
                setIsOpen(false)
            }}/>)}
        </>
    )
}
export default SignInForm
