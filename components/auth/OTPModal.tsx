import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {LoaderCircle, X} from 'lucide-react';
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {REGEXP_ONLY_DIGITS} from 'input-otp';
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {OtpType} from "@/constants/enum";
import {ErrorResponse, OtpVerificationRequest, SendVerifyEmailRequest} from "@/types/apis/auth";

type verifyType = "verifyEmail" | "resetPassword";

const OTPModal = ({email, onClose, type}: {
    email: string,
    onClose: () => void,
    type: verifyType
}) => {
    const [isOpen, setIsOpen] = React.useState(true)
    const [code, setCode] = React.useState<string>("")
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const req: OtpVerificationRequest = {
                email: email,
                code: code,
                type: type === "verifyEmail" ? OtpType.verifyEmail : OtpType.resetPassword
            }
            const res = await fetch("/api/auth/verifyOtp", {
                method: "POST",
                body: JSON.stringify(req),
            })
            if (!res.ok) {
                toast.error((type === "verifyEmail") ? "Xác thực thất bại" : "Đổi mật khẩu thất bại")
                return
            }
            setIsOpen(false)
            onClose()
            toast.success((type === "verifyEmail") ? "Xác thực thành công" : "Đổi mật khẩu thành công")
        } catch (err {
            toast.error("Lỗi không xác định!");
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOTP = async () => {
        console.log("resend otp")
        try {
            const otpReq: SendVerifyEmailRequest = {email: email}
            const sendEmail =
                await fetch((type === "verifyEmail") ? "/api/auth/sendOtp" : "/api/auth/resetPassword", {
                    method: "POST",
                    body: JSON.stringify(otpReq),
                })
            if (!sendEmail.ok) {
                const errorData: ErrorResponse = await sendEmail.json();
                toast.error(errorData.message === "" ? `Gửi email thất bại` : errorData.message);
                return;
            }
            toast.success("Email xác thực đã được gửi.");
        } catch (error) {
            toast.error("Lỗi không xác định!");
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle
                        className={"text-center text-foreground w-full space-y-0 flex flex-col justify-end items-end"}>
                        <X onClick={() => {
                            setIsOpen(false)
                            onClose()
                        }} className={"cursor-pointer"}/>
                        <p className={"w-full heading2"}>Nhập mã OTP</p>
                    </AlertDialogTitle>
                    <AlertDialogDescription className={"subtitle2 text-center"}>
                        Chúng mình đã gửi mã OTP đến <span className={"text-primary"}>{email}</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={code}
                          onChange={(value) => setCode(value as string)}>
                    <InputOTPGroup className={"flex justify-around items-center w-full"}>
                        <InputOTPSlot index={0}/>
                        <InputOTPSlot index={1}/>
                        <InputOTPSlot index={2}/>
                        <InputOTPSlot index={3}/>
                        <InputOTPSlot index={4}/>
                        <InputOTPSlot index={5}/>
                    </InputOTPGroup>
                </InputOTP>
                <AlertDialogDescription
                    className={"w-full text-center flex flex-col items-center justify-center space-x-1 subtitle2"}>
                    Mã sẽ hết hạn trong vòng 15 phút. Bạn chưa thấy mã?
                    <Button variant={"link"} onClick={handleResendOTP} className={"p-0 m-1"}>Gửi lại OTP</Button>
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleSubmit} className={"w-full rounded-md"}
                                       disabled={isLoading}>
                        Xác nhận
                        {isLoading && (
                            <LoaderCircle className={"size-5 animate-spin"}/>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
export default OTPModal;

