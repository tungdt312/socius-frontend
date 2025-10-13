"use client"

import React, {useState} from 'react'
import {Card, CardContent} from "@/components/ui/card";
import {Input} from './ui/input';
import {Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet,} from "@/components/ui/field"
import {Button} from "@/components/ui/button";
import {ArrowBigLeft, CalendarDays, LoaderCircle} from "lucide-react";
import {useRouter} from "next/navigation";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";

const signUpSchema = z.object({
    username: z.string().min(5, "Tên đăng nhập phải có ít nhất 5 ký tự"),
    password: z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
    fullName: z.string(),
    email: z.email(),
    dayOfBirth: z.date().min(new Date("1900-01-01")).max(Date.now()),
})

type signUpState = "personalInfo" | "accountInfo";

const SignUpForm = () => {
    const router = useRouter()

    const [errors, setErrors] = useState("");
    const [formState, setFormState] = useState<signUpState>("personalInfo")
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        mode: "onChange",
        defaultValues: {
            username: "",
            password: "",
            fullName: "",
            email: "",
            dayOfBirth: new Date
        },
    })
    const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
        setIsLoading(true);
        setErrors("")
        try {
            console.log(JSON.stringify(values));
            await new Promise((res) => setTimeout(res, 1000))
        } catch (error) {
            console.log(error);
            setErrors("Không thể đăng ký. Đã có lỗi xảy ra.")
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            <h1 className={"text-muted-foreground heading1"}>Đăng ký</h1>
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
                                            <FieldLabel htmlFor="fullName">Tên đầy đủ *</FieldLabel>
                                            <Input id="fullName" type="text"
                                                   placeholder="Tên đầy đủ" {...form.register("fullName")} />
                                            {form.formState.errors.fullName && (
                                                <FieldError>
                                                    {form.formState.errors.fullName.message}
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
                                                        {form.watch("dayOfBirth")
                                                            ? form.watch("dayOfBirth")?.toLocaleDateString("vi-VN", {
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
                                                        selected={form.watch("dayOfBirth")}
                                                        captionLayout="dropdown"
                                                        onSelect={(date) => form.setValue("dayOfBirth", date || new Date())}
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            {form.formState.errors.dayOfBirth && (
                                                <FieldError>
                                                    Ngày sinh không hợp lệ!
                                                </FieldError>
                                            )}
                                        </Field>
                                    </FieldGroup>
                                    <div className={"flex items-center justify-center w-full"}>
                                        <Button type="button" className={"w-full"}
                                                onClick={async () => {
                                                    const isValid = await form.trigger(["fullName", "email", "dayOfBirth"]);
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
                                            {form.formState.errors.password && (
                                                <FieldError>
                                                    {form.formState.errors.password.message}
                                                </FieldError>
                                            )}
                                        </Field><Field orientation={"responsive"}>
                                        <FieldLabel>Xác nhận mật khẩu *</FieldLabel>
                                        <Input type={"password"}
                                               placeholder="Xác nhận mật khẩu"/>
                                        {form.formState.errors.password && (
                                            <FieldError>
                                                {form.formState.errors.password.message}
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
                                    {errors && (
                                        <p className={"body2 text-destructive w-full text-center"}>{errors}</p>)}
                                </div>
                            }
                        </FieldSet>
                    </form>
                    <div className="w-full max-w-md flex items-center justify-center space-x-1 subtitle2">
                        <p>Đã có tài khoản?</p>
                        <Button className={"p-0"} variant={"link"} type={"button"} onClick={() => router.push("/sign-up")}>
                            Đăng nhập ngay
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

    )
}
export default SignUpForm
