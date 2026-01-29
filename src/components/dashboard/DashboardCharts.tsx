"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";

interface DashboardChartsProps {
    dailyRevenueData: { date: string; revenue: number }[];
    salesByCategoryData: { category: string; sales: number; fill: string }[];
}

const revenueChartConfig = {
    revenue: {
        label: "Receita (R$)",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

const categoryChartConfig = {
    sales: { label: "Vendas" },
    // Dynamic config would be improved in a real app
    "Ganho de Massa": { label: "Ganho de Massa", color: "hsl(var(--chart-1))" },
    "Endurance": { label: "Endurance", color: "hsl(var(--chart-2))" },
    "Emagrecimento": { label: "Emagrecimento", color: "hsl(var(--chart-3))" },
    "Vitaminas": { label: "Vitaminas", color: "hsl(var(--chart-4))" },
    "Outros": { label: "Outros", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


export function DashboardCharts({ dailyRevenueData, salesByCategoryData }: DashboardChartsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-semibold">Receita Diária (Últimos 7 Dias)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={revenueChartConfig} className="min-h-[250px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={dailyRevenueData}
                            margin={{
                                left: 12,
                                right: 12,
                                top: 5,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Line
                                dataKey="revenue"
                                type="monotone"
                                stroke="var(--color-revenue)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-revenue)",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            />
                            <RechartsLegend content={<ChartLegendContent />} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-semibold">Vendas por Categoria</CardTitle>
                </CardHeader>
                <CardContent className="flex aspect-square items-center justify-center pb-0">
                    <ChartContainer
                        config={categoryChartConfig}
                        className="mx-auto aspect-square max-h-[300px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel nameKey="category" />}
                            />
                            <Pie
                                data={salesByCategoryData}
                                dataKey="sales"
                                nameKey="category"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                {salesByCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <RechartsLegend
                                content={<ChartLegendContent nameKey="category" className="flex-wrap" />}
                                verticalAlign="bottom"
                                align="center"
                            />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
