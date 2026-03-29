"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type SchoolPieChartDatum = {
  label: string
  value: number
}

type SchoolPieChartProps = {
  cardTitle: string
  cardDescription?: string
  valueLabel?: string
  data: SchoolPieChartDatum[]
}

export function SchoolPieChart({
  cardTitle,
  cardDescription,
  valueLabel = "Count",
  data,
}: SchoolPieChartProps) {
  const safeData = data.filter((item) => item.value > 0)
  const visibleData = safeData.length > 0 ? safeData : [{ label: "No data", value: 1 }]

  const chartData = visibleData.map((item, index) => ({
    segment: `segment-${index + 1}`,
    label: item.label,
    value: item.value,
    fill: `var(--color-segment-${(index % 5) + 1})`,
  }))

  const chartConfig = {
    value: {
      label: valueLabel,
    },
    "segment-1": { label: chartData[0]?.label ?? "Segment 1", color: "var(--chart-1)" },
    "segment-2": { label: chartData[1]?.label ?? "Segment 2", color: "var(--chart-2)" },
    "segment-3": { label: chartData[2]?.label ?? "Segment 3", color: "var(--chart-3)" },
    "segment-4": { label: chartData[3]?.label ?? "Segment 4", color: "var(--chart-4)" },
    "segment-5": { label: chartData[4]?.label ?? "Segment 5", color: "var(--chart-5)" },
  } satisfies ChartConfig

  const total = safeData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{cardTitle}</CardTitle>
        {cardDescription ? (
          <CardDescription>{cardDescription}</CardDescription>
        ) : (
          <CardDescription>{total} total</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[240px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="segment" />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="segment"
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
