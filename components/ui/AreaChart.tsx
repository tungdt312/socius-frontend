"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboardService";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { ReportableType } from "@/types/dtos/report"

// 1. Cấu hình khớp với key trong combinedData
const chartConfig = {
    users: {
        label: "Người dùng",
        color: "var(--chart-1)",
    },
    posts: {
        label: "Bài viết",
        color: "var(--chart-3)",
    },
    comments: {
        label: "Bình luận",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function ChartAreaInteractive() {
    const now = new Date();
    const [type, setType] = React.useState<string>("MONTH")
    const [month, setMonth] = useState<number>(now.getMonth() + 1)
    const [year, setYear] = React.useState<number>(now.getFullYear())
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const years = Array.from({ length: 10 }, (_, i) => now.getFullYear() - i);
    // Tạo danh sách 12 tháng
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [usersData, postsData] = await Promise.all([
                getDashboardStats({ type, targetType: ReportableType.USER, time:( type == "MONTH") ? `${month}%2F${year}` : `${year}` }),
                getDashboardStats({ type, targetType: ReportableType.POST, time: (type == "MONTH") ? `${month}%2F${year}` : `${year}` }),
            ]);

            const combinedData = usersData.map((item: any, index: number) => ({
                time: item.label,
                users: item.value,
                posts: postsData[index]?.value || 0,
            }));
            console.log(combinedData);
            setData(combinedData)
        } catch (e) {
            toast.error((e as Error).message|| "Lỗi khi tải dữ liệu")
        } finally {
            setIsLoading(false)
        }
    }

    // Tự động tải lại khi đổi "Theo tháng" hoặc "Theo năm"
    useEffect(() => {
        fetchData()
    }, [type, month, year])

    return (
        <Card className="pt-0 w-full">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Thống kê hệ thống</CardTitle>
                    <CardDescription>
                        {type === "MONTH"
                            ? `Dữ liệu chi tiết tháng ${month} năm ${year}`
                            : `Dữ liệu chi tiết các tháng trong năm ${year}`}
                    </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2 p-4 sm:p-6">
                    {/* Chọn Loại (Tháng/Năm) */}
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue placeholder="Loại" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MONTH">Theo tháng</SelectItem>
                            <SelectItem value="YEAR">Theo năm</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Chọn Tháng (Chỉ hiện nếu type là MONTH) */}
                    {type === "MONTH" && (
                        <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                            <SelectTrigger className="w-[110px] h-9">
                                <SelectValue placeholder="Tháng" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m} value={m.toString()}>
                                        Tháng {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Chọn Năm (Luôn hiển thị) */}
                    <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                        <SelectTrigger className="w-[100px] h-9">
                            <SelectValue placeholder="Năm" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-[250px] w-full gap-2">
                        <LoaderCircle className="animate-spin" /> Đang tải dữ liệu...
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillPosts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-posts)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-posts)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                                dataKey="posts"
                                type="linear"
                                fill="url(#fillPosts)"
                                stroke="var(--color-posts)"
                                stackId="a"
                            />
                            <Area
                                dataKey="users"
                                type="linear"
                                fill="url(#fillUsers)"
                                stroke="var(--color-users)"
                                stackId="a"
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}