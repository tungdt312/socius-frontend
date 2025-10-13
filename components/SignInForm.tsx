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

const signInSchema = z.object({
    username: z.string().min(5, "Tên đăng nhập phải có ít nhất 5 ký tự"),
    password: z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
})

const SignInForm = () => {
    const router = useRouter()

    const [errors, setErrors] = useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [isForgotPassword, setIsForgotPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof signInSchema>) => {
        setIsLoading(true);
        setErrors("")
        try {
            console.log(JSON.stringify(values));
            await new Promise((res) => setTimeout(res, 1000))
        } catch (error) {
            console.log(error);
            setErrors("Không thể đăng nhập. Đã có lỗi xảy ra.")
        } finally {
            setIsLoading(false);
        }

    }
    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            <h1 className={"text-muted-foreground heading1"}>Đăng nhập</h1>
            <Card className={"w-full min-w-[350px]"}>
                <CardContent >
                    <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-4"} >
                        <FieldSet>
                            <FieldGroup>
                                <Field orientation={"responsive"}>
                                    <FieldLabel htmlFor="username">Tên đăng nhập</FieldLabel>
                                    <Input id="username" type="text" placeholder="Tên đăng nhập" {...form.register("username")} />
                                    {form.formState.errors.username && (
                                        <FieldError>
                                            {form.formState.errors.username.message}
                                        </FieldError>
                                    )}
                                </Field>
                                <Field orientation={"responsive"}>
                                    <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                                    <div className={"flex items-center w-full space-x-2"}>
                                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="Mật khẩu"  {...form.register("password")}/>
                                        <Button type={"button"} className={"rounded-full size-8 transition-all"} variant={showPassword ? "default" : "outline"} onClick={() => setShowPassword(!showPassword)}>
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
                                        <Button className={"p-0"} variant={"link"} onClick={() => setIsForgotPassword(true)}>
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
                        {errors && (<p className={"body2 text-destructive w-full text-center"}>{errors}</p>)}
                    </form>
                    <div className="w-full max-w-md flex items-center justify-center space-x-1 subtitle2">
                        <p>Chưa có tài khoản?</p>
                        <Button className={"p-0"} variant={"link"} type={"button"} onClick={() => router.push("/sign-up")}>
                            Đăng ký ngay
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {isForgotPassword && (<ForgetPasswordForm/>)}
        </div>

    )
}
export default SignInForm
