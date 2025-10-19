
import React from 'react'
import {
    AlertDialog, AlertDialogAction,
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

const OTPModal = ({email, onSuccess, onClose}: { email: string, onSuccess: () => void, onClose: () => void }) => {
    const [isOpen, setIsOpen] = React.useState(true)
    const [password, setPassword] = React.useState<string>("")
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [errorMessage, setErrorMessage] = React.useState<string>("")

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            console.log(password)
            onSuccess()
            setIsOpen(false)
            onClose()
        } catch (err) {
            toast.error("Xác thực thất bại.")
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOTP = async () => {
        console.log("resend otp")
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
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={password}
                          onChange={(value) => setPassword(value as string)}>
                    <InputOTPGroup className={"flex justify-around items-center w-full"}>
                        <InputOTPSlot index={0}/>
                        <InputOTPSlot index={1}/>
                        <InputOTPSlot index={2}/>
                        <InputOTPSlot index={3}/>
                        <InputOTPSlot index={4}/>
                        <InputOTPSlot index={5}/>
                    </InputOTPGroup>
                </InputOTP>
                <AlertDialogDescription className={"w-full max-w-md text-center flex items-center justify-center space-x-1 subtitle2"}>
                    Mã sẽ hết hạn trong vòng 15 phút. <br/> Bạn chưa thấy mã?<Button variant={"link"} onClick={handleResendOTP} className={"p-0 ml-1"}>Gửi lại OTP</Button>

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
export default OTPModal

