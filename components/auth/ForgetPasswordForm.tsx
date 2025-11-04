"use client"
import React from 'react'
import OTPModal from "@/components/auth/OTPModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {LoaderCircle, X} from "lucide-react";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Field, FieldError, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {changePasswordSchema} from "@/schema/authSchema";
import {ErrorResponse} from "@/types/dtos/auth";
import {resetPassword} from "@/services/authService";


const ForgetPasswordForm = ({onClose}: {onClose: () => void }) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });

    const handleSubmit = async () => {
        setIsLoading(true);
        try{
            const res = await resetPassword({
                    email: form.getValues("email"),
                    newPassword: form.getValues("password")
                })
            toast.success("Email xác thực đã được gửi.");
            setIsVerifying(true)
        }
        catch(error: unknown) {
            toast.error((error as Error).message??"Gửi email thất bại");
        }
        finally {
            setIsLoading(false);
        }
    }
    return (
        <>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen} >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle
                        className={"text-center text-foreground w-full space-y-0 flex flex-col justify-end items-end"}>
                        <X onClick={() => {
                            setIsOpen(false)
                            onClose()
                        }} className={"cursor-pointer"}/>
                        <p className={"w-full heading2"}>Quên mật khẩu?</p>
                    </AlertDialogTitle>
                    <AlertDialogDescription className={"subtitle2 text-center"}>
                        Chúng mình sẽ gửi mã OTP đến <span className={"text-primary"}>Email của bạn</span> để xác thực
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <FieldSet>
                <div className="space-y-4">
                    <FieldGroup>
                        <Field >
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input id="email" type="email"
                                   placeholder="Email" {...form.register("email")} />
                            {form.formState.errors.email && (
                                <FieldError>
                                    {form.formState.errors.email.message}
                                </FieldError>
                            )}
                        </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Mật khẩu *</FieldLabel>
                                <Input id="password" type={"password"}
                                       placeholder="Mật khẩu"  {...form.register("password")}/>
                                {(form.formState.errors.password) && (
                                    <FieldError>
                                        {form.formState.errors.password.message}
                                    </FieldError>
                                )}
                            </Field>
                            <Field >
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
                </div>
                </FieldSet>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={()=>{
                        handleSubmit()
                    }} className={"w-full rounded-md"}
                                       disabled={isLoading}>
                       Gửi
                        {isLoading && (
                            <LoaderCircle className={"size-5 animate-spin"}/>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
            {isVerifying && <OTPModal type={"resetPassword"} email={form.getValues("email")}
                                      newPassword={form.getValues("password")}
                                      onClose={()=> {setIsVerifying(false)
                                          onClose()}}/>}
        </>
    )

}
export default ForgetPasswordForm
