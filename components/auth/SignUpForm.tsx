"use client"

import React, {useState} from 'react'
import {Card, CardContent} from "@/components/ui/card";
import {Input} from '../ui/input';
import {Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet,} from "@/components/ui/field"
import {Button} from "@/components/ui/button";
import {ArrowBigLeft, CalendarDays, LoaderCircle} from "lucide-react";
import {useRouter} from "next/navigation";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import OTPModal from "@/components/auth/OTPModal";
import {toast} from "sonner";
import {signUpSchema} from "@/schema/authSchema";
import {ErrorResponse, RegisterRequest, SendVerifyEmailRequest} from "@/types/apis/auth";


type signUpState = "personalInfo" | "accountInfo";

const SignUpForm = () => {
    const router = useRouter()

    const [formState, setFormState] = useState<signUpState>("personalInfo")
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        mode: "onChange",
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
            fullname: "",
            email: "",
            dateOfBirth: new Date()
        },
    })

    const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
        setIsLoading(true);
        try {
            const req: RegisterRequest = {
                fullname: values.fullname,
                username: values.username,
                password: values.password,
                email: values.email,
                dateOfBirth: values.dateOfBirth.toISOString(),
            }
            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify(req),
            })
            if (!res.ok) {
                const errorData: ErrorResponse = await res.json();
                toast.error(errorData.message === "" ? `Đăng ký thất bại (${res.status})` : errorData.message);
                return;
            }
            toast.success("Đăng ký thành công.");
            const otpReq: SendVerifyEmailRequest = {email: values.email}
            const sendEmail = await fetch("/api/auth/sendOtp", {
                method: "POST",
                body: JSON.stringify(otpReq),
            })
            if (sendEmail.ok) {
                toast.success("Email xác thực đã được gửi.");
                setIsOpen(true);
            } else {
                const errorData: ErrorResponse = await res.json();
                toast.error(errorData.message === "" ? `Gửi email xác thực thất bại (${res.status})` : errorData.message);
            }
        } catch (error) {
            toast.error("Lỗi không xác định!");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Card className={"w-full min-w-[350px]"}>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldSet>
                            {formState === "personalInfo" &&
                                <div className={"space-y-4"}>
                                    <FieldLegend className={"text-center"}>Thông tin cá nhân</FieldLegend>
                                    <FieldSeparator className={"mb-2"}/>
                                    <FieldGroup>
                                        <Field orientation={"responsive"}>
                                            <FieldLabel htmlFor="fullname">Tên đầy đủ *</FieldLabel>
                                            <Input id="fullname" type="text"
                                                   placeholder="Tên đầy đủ" {...form.register("fullname")} />
                                            {form.formState.errors.fullname && (
                                                <FieldError>
                                                    {form.formState.errors.fullname.message}
                                                </FieldError>
                                            )}
                                        </Field>
                                        <Field orientation={"responsive"}>
                                            <FieldLabel htmlFor="email">Email *</FieldLabel>
                                            <Input id="email" type={"email"}
                                                   placeholder="abc@gmail.com"  {...form.register("email")}/>
                                            {form.formState.errors.email && (
                                                <FieldError>
                                                    {form.formState.errors.email.message}
                                                </FieldError>
                                            )}
                                        </Field>
                                        <Field orientation="responsive">
                                            <FieldLabel htmlFor="dayOfBirth">Ngày sinh</FieldLabel>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between font-normal"
                                                        type="button"
                                                    >
                                                        {form.watch("dateOfBirth")
                                                            ? form.watch("dateOfBirth")?.toLocaleDateString("vi-VN", {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric"
                                                                }
                                                            )
                                                            : "Chọn ngày"}
                                                        <CalendarDays className="ml-2 h-4 w-4 opacity-50"/>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={form.watch("dateOfBirth")}
                                                        captionLayout="dropdown"
                                                        onSelect={(date) => form.setValue("dateOfBirth", date || new Date())}
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            {form.formState.errors.dateOfBirth && (
                                                <FieldError>
                                                    Ngày sinh không hợp lệ!
                                                </FieldError>
                                            )}
                                        </Field>
                                    </FieldGroup>
                                    <div className={"flex items-center justify-center w-full"}>
                                        <Button type="button" className={"w-full"}
                                                onClick={async () => {
                                                    const isValid = await form.trigger(["fullname", "email", "dateOfBirth"]);
                                                    if (isValid) setFormState("accountInfo");
                                                }}>
                                            Tiếp theo
                                        </Button>
                                    </div>
                                </div>
                            }
                            {formState === "accountInfo" &&
                                <div className={"space-y-4"}>
                                    <FieldLegend className={"text-center"}>Thông tin tài khoản</FieldLegend>
                                    <FieldSeparator className={"mb-2"}/>
                                    <FieldGroup>
                                        <Field orientation={"responsive"}>
                                            <FieldLabel htmlFor="username">Tên đăng nhập *</FieldLabel>
                                            <Input id="username" type="text"
                                                   placeholder="Tên đăng nhập" {...form.register("username")} />
                                            {form.formState.errors.username && (
                                                <FieldError>
                                                    {form.formState.errors.username.message}
                                                </FieldError>
                                            )}
                                        </Field>
                                        <Field orientation={"responsive"}>
                                            <FieldLabel htmlFor="password">Mật khẩu *</FieldLabel>
                                            <Input id="password" type={"password"}
                                                   placeholder="Mật khẩu"  {...form.register("password")}/>
                                            {(form.formState.errors.password) && (
                                                <FieldError>
                                                    {form.formState.errors.password.message}
                                                </FieldError>
                                            )}
                                        </Field>
                                        <Field orientation={"responsive"}>
                                            <FieldLabel>Xác nhận mật khẩu *</FieldLabel>
                                            <Input type={"password"}
                                                   placeholder="Xác nhận mật khẩu" {...form.register("confirmPassword")}/>
                                            {(form.formState.errors.confirmPassword) && (
                                                <FieldError>
                                                    {form.formState.errors.confirmPassword.message}
                                                </FieldError>
                                            )}
                                        </Field>
                                    </FieldGroup>
                                    <div className={"flex items-center justify-center w-full space-x-2 px-6"}>
                                        <Button type="button" className={"size-9 "}
                                                onClick={() => setFormState("personalInfo")}>
                                            <ArrowBigLeft size={24}/>
                                        </Button>
                                        <Button type="submit" className={"w-full"} disabled={isLoading}>
                                            {isLoading && (
                                                <LoaderCircle className={"mr-1 size-5 animate-spin"}/>
                                            )}
                                            Đăng ký
                                        </Button>
                                    </div>
                                </div>
                            }
                        </FieldSet>
                    </form>
                    <div className="w-full max-w-md flex items-center justify-center space-x-1 subtitle2">
                        <p>Đã có tài khoản?</p>
                        <Button className={"p-0"} variant={"link"} type={"button"}
                                onClick={() => router.push("/sign-in")}>
                            Đăng nhập ngay
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {isOpen && (
                <OTPModal type={"verifyEmail"} email={form.getValues("email")}
                          onClose={() => {
                    setIsOpen(false)
                }}/>)}
        </>

    )
}
export default SignUpForm
