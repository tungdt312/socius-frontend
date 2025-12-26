import React from 'react'
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import FlaggedPostTable from "@/components/moderator/FlaggedPostTable";
import FlaggedCommentTable from "@/components/moderator/FlaggedCommentTable";
import ModeratorUserTable from "@/components/moderator/ModeratorUserTable";
import FlaggedMessageTable from "@/components/moderator/FlaggedMessageTable";
import { ReportableType } from '@/types/dtos/report';
import {ReportTable} from "@/components/moderator/ReportTable";
import {ComplaintTable} from "@/components/moderator/ComplaintTable";
import {CommentViewer, UserReviewer} from "@/components/moderator/ContentReview";
import ModeratorLogTable from "@/components/moderator/ModeratorLog";
interface PageProps {
    params: { id: string };
}

const Page = async ({params}: PageProps) => {
    const id = (await params).id;
    // @ts-ignore
    return (
        <div className={"flex flex-col justify-start items-start gap-4 mx-auto w-full h-full p-4 text-foreground"}>
            <div className={"flex items-center justify-start w-full h-fit bg-background px-4 py-2 ring-1 ring-border rounded-lg"}>
                <span className={"heading5"}>Người dùng vi phạm (ID: {id})</span>
            </div>
            <div className={"flex flex-col lg:flex-row items-start justify-start w-full h-fit gap-4"}>
                <div className={"flex flex-col items-center justify-start w-full h-fit"}>
                    <UserReviewer userId={id} />
                    <ModeratorLogTable targetId={id} targetType={ReportableType.USER}/>
                    <ReportTable targetId={id} targetType={ReportableType.USER}/>
                    <ComplaintTable targetId={id} targetType={ReportableType.USER}/>
                </div>
            </div>
        </div>
    )
}
export default Page
