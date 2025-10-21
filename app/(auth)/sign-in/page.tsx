import React from 'react'
import SignInForm from "@/components/SignInForm";

const Signin = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            <h1 className={"text-muted-foreground heading1"}>Đăng nhập</h1>
            <SignInForm/>
        </div>
    )
}
export default Signin
