import React from 'react'
import SignUpForm from "@/components/auth/SignUpForm";

const Signup = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            <h1 className={"text-muted-foreground heading1"}>Đăng ký</h1>
            <SignUpForm/>
        </div>
    )
}
export default Signup
