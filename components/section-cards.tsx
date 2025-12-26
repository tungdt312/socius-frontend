"use client"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {DashboardSummary} from "@/types/dtos/dashboard";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {getDashboardSummary} from "@/services/dashboardService";
import {Loader, LoaderCircle} from "lucide-react";

export function SectionCards() {
  const [data, setData] = useState<DashboardSummary | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fetchData = async () => {
    try{
      setIsLoading(true)
      const res = await getDashboardSummary()
      setData(res)
    }catch (e) {
      toast.error("Lỗi khi tải dữ liệu")
    }finally{
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  },[])
  if (isLoading) {
    return (
        <div className={"flex justify-center items-center w-full"}>
          <LoaderCircle size={24} className={"animate-spin"} />
          Đang tải...
        </div>
    )
  }
  if (!data) return null
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-5">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Người dùng</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.totalUsers.toLocaleString("en-US")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Tổng số người dùng trên hệ thống
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Bài viết</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.totalPosts.toLocaleString("en-US")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Tổng số bài viết trên hệ thống
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Bình luận</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.totalComments.toLocaleString("en-US")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Tổng số bình luận trên hệ thống
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vi phạm</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.pendingReports.toLocaleString("en-US")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Tổng số vi phạm chưa được xử lý trên hệ thống
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Đã khóa</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.blockedContentCount.toLocaleString("en-US")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Tổng số nội dung độc hại đã được khóa
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
