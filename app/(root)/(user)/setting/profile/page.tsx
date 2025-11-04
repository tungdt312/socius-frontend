import React from 'react'
import ProfileForm from "@/components/user/ProfileForm";

const Page = () => {
    return (
        <div className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] min-h-full h-fit p-4 text-foreground "}>
            <p className={"heading5 mb-4"}>Sửa trang cá nhân</p>
            <ProfileForm/>
        </div>
    )
}
export default Page
