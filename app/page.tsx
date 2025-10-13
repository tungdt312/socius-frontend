import Image from "next/image";
import {Button} from "@/components/ui/button";
import ThemeModeToggle from "@/components/ThemeToggle";
import {ChartPieDonutText} from "@/components/ui/piechart_donut_wtext";
import {ThemeProvider} from "@/components/ThemeProvider";
import {ChartAreaInteractive} from "@/components/ui/AreaChart";

export default function Home() {
  return (
      <div className={"flex space-x-2 items-center justify-center w-full h-screen p-4 bg-secondary"}>
          <ChartPieDonutText/>
          <ChartAreaInteractive/>
          <ThemeModeToggle/>
      </div>
  );
}
