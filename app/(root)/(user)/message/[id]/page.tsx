import React from 'react'
import {ChatWindow} from "@/components/message/ChatWindow";

interface PageProps {
    params: { id: string };
}

const Page = async ({params}: PageProps) => {
    const conversationId = (await params).id;
    return (
        <ChatWindow conversationId={conversationId} />
    )
}
export default Page
