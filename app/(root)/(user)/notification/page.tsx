import React from 'react'
import NotificationList from "@/components/user/NotificationList";

const NotificationPage = () => {
    return (
        <div className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] flex-1 overflow-hidden p-4 text-foreground"}>
            <NotificationList/>
        </div>
    )
}
export default NotificationPage
