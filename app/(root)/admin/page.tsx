import React from 'react'
import {SectionCards} from "@/components/section-cards";
import {ChartAreaInteractive} from "@/components/ui/AreaChart";
import {ChartPieDonutText} from "@/components/ui/piechart_donut_wtext";

const Page = () => {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <SectionCards/>
                </div>
                <div className="px-4 lg:px-6 flex flex-col md:flex-row gap-4">
                    <ChartAreaInteractive />
                    <ChartPieDonutText/>
                </div>
            </div>
        </div>
    )
}
export default Page
