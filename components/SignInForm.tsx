"use client"

import React, {useState} from 'react'
import {Card, CardContent} from "@/components/ui/card";
import {Input} from './ui/input';
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet,} from "@/components/ui/field"
import {Button} from "@/components/ui/button";
import {EyeClosed, EyeIcon, LoaderCircle} from "lucide-react";
import ForgetPasswordForm from "@/components/ForgetPasswordForm";
import {useRouter} from "next/navigation";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {signInSchema} from "@/schema/authSchema";
import {fetcher} from "@/lib/fetcher";
import {AccountStatus} from "@/constants/enum";
import OTPModal from "@/components/OTPModal";
import {LoginRequest, LoginResponse, SendVerifyEmailResponse} from "@/types/api";

const SignInForm = () => {
    const router = useRouter()

    const [showPassword, setShowPassword] = React.useState(false);
    const [isForgotPassword, setIsForgotPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    let email: string = "";

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
            const res = await fetcher<LoginResponse>("/api/auth/login", {
                method: "POST",
                body: JSON.stringify(req),
            });
            if (res.status !== AccountStatus.BLOCKED && res.status !== AccountStatus.PENDING) {
                toast.success("Đăng nhập thành công.")
                router.push("/");
            }
            else if (res.status == AccountStatus.BLOCKED){
                toast.warning("Tài khoản đã bị hạn chế một số chức năng. Liên hệ hỗ trợ để biết thêm chi tiết.")
                router.push("/");
            }
            else if (res.status == AccountStatus.PENDING){
                toast.error("Tài khoản chưa xác thực email. Vui lòng xác thực", {
                    action: {
                        label: "Gửi mail",
                        onClick: async()=> {
                            const sendEmail = await fetcher<SendVerifyEmailResponse>("/api/auth/sendOtp",{
                                method: "POST",
                                body: JSON.stringify({email: res.email}),
                            })
                            toast.success("Email xác thực đã được gửi.");
                            email = res.email;
                            setIsOpen(true);
                        }
                    }
                })
            }


        } catch (error: any) {
            toast.error(error.message);
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
            {isForgotPassword && (<ForgetPasswordForm onClose={() => setIsForgotPassword(false)} />)}
            {isOpen && (<OTPModal type={"verifyEmail"} email={email} onSuccess={() => {
                toast.success("Xác thực thành công.");
                router.push("/sign-in");
            }} onClose={()=> {setIsOpen(false)}}/>)}
        </>
    )
}
export default SignInForm
