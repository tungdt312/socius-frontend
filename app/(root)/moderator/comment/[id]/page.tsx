import React from 'react'
import {ReportTable} from "@/components/moderator/ReportTable";
import {CommentViewer} from "@/components/moderator/ContentReview";
import {ComplaintTable} from "@/components/moderator/ComplaintTable";
import {ReportableType} from "@/types/dtos/report";
import ModeratorLogTable from "@/components/moderator/ModeratorLog";

interface PageProps {
    params: { id: string };
}

const Page = async ({params}: PageProps) => {
    const id = (await params).id;
    return (
        <div className={"flex flex-col justify-start items-start gap-4 mx-auto w-full h-full p-4 text-foreground"}>
            <div className={"flex items-center justify-start w-full h-fit bg-background px-4 py-2 ring-1 ring-border rounded-lg"}>
                <span className={"heading5"}>Bình luận vi phạm (ID: {id})</span>
            </div>
            <div className={"flex flex-col lg:flex-row items-start justify-start w-full h-fit gap-4"}>
                <div className={"flex flex-col items-center justify-start w-full lg:w-1/2 h-fit"}>
                    <CommentViewer commentId={id} />
                    <ModeratorLogTable targetId={id} targetType={ReportableType.COMMENT}/>
                </div>
                <div className={"flex flex-col items-center justify-start w-full lg:w-1/2 h-fit"}>
                    <ReportTable targetId={id} targetType={ReportableType.COMMENT}/>
                    <ComplaintTable targetId={id} targetType={ReportableType.COMMENT}/>
                </div>
            </div>
        </div>
    )
}
export default Page
