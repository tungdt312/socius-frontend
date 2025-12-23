import React from 'react'
import {PostViewer} from "@/components/moderator/ContentReview";
import {ReportTable} from "@/components/moderator/ReportTable";
import {ReportableType} from "@/types/dtos/report";
import {ComplaintTable} from "@/components/moderator/ComplaintTable";
import ModeratorLogTable from "@/components/moderator/ModeratorLog";

interface PageProps {
    params: { id: string };
}

const Page = async ({params}: PageProps) => {
    const id = (await params).id;
    return (
        <div className={"flex flex-col justify-start items-start gap-4 mx-auto w-full h-full p-4 text-foreground"}>
            <div className={"flex items-center justify-start w-full h-fit bg-background px-4 py-2 ring-1 ring-border rounded-lg"}>
                <span className={"heading5"}>Bài viết vi phạm (ID: {id})</span>
            </div>
            <div className={"flex flex-col lg:flex-row items-start justify-start w-full h-fit gap-4"}>
                <div className={"flex flex-col items-center justify-start w-full lg:w-1/2 h-fit"}>
                    <PostViewer postId={id} />
                    <ModeratorLogTable targetId={id} targetType={ReportableType.POST}/>
                </div>
                <div className={"flex flex-col items-center justify-start w-full lg:w-1/2 h-fit"}>
                    <ReportTable targetId={id} targetType={ReportableType.POST}/>
                    <ComplaintTable targetId={id} targetType={ReportableType.POST}/>
                </div>
            </div>
        </div>
    )
}
export default Page
