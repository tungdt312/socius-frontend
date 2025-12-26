"use client"

import * as React from "react"
import {LoaderCircle, TrendingUp} from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {useEffect, useMemo, useState} from "react";
import {DashboardItem, DashboardSummary, ModeratorSummary} from "@/types/dtos/dashboard";
import {getDashboardModeration, getDashboardSummary} from "@/services/dashboardService";
import {toast} from "sonner";

export const description = "A donut chart with text"

const chartData = [
    { target: "auto", number: 275, fill: "var(--color-auto)" },
    { target: "manual", number: 200, fill: "var(--color-manual)" },
]

const chartConfig = {
    number: {
        label: "Nội dung",
    },
    auto: {
        label: "AI quét",
        color: "var(--chart-1)",
    },
    manual: {
        label: "Thủ công",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function ChartPieDonutText() {
    const [data, setData] = useState<ModeratorSummary | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const fetchData = async () => {
        try{
            setIsLoading(true)
            const res = await getDashboardModeration()
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
    const chartData = useMemo(() => {
        if (!data) return [];
        return [
            { target: "auto", number: data.totalAutoBanned, fill: "var(--color-auto)" },
            { target: "manual", number: data.totalManualBanned, fill: "var(--color-manual)" },
        ]
    }, [data]);
    const totalBanned = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.number, 0)
    }, [data])
    if (!data) return null

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Tỷ lệ kiểm duyệt</CardTitle>
                <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="number" // ✅ Sửa: Khớp với key trong chartData
                            nameKey="target" // ✅ Sửa: Khớp với key trong chartData
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalBanned.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Nội dung bị khóa
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                </div>
                <div className="text-muted-foreground leading-none">
                    Số nội dung bị khóa do vi phạm tiêu chuẩn cộng đồng
                </div>
            </CardFooter>
        </Card>
    )
}
