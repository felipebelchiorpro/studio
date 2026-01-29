"use client";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    ResponsiveContainer,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart as LineChartIcon, BarChartBig } from "lucide-react";

interface AnalyticsChartsProps {
    salesByDate: { date: string; value: number }[];
    topProducts: { name: string; quantity: number }[];
}

const salesChartConfig = {
    value: {
        label: "Vendas (R$)",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

const productsChartConfig = {
    quantity: {
        label: "Quantidade",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export function AnalyticsCharts({ salesByDate, topProducts }: AnalyticsChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
                        Análise de Vendas ao Longo do Tempo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={salesChartConfig} className="min-h-[300px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={salesByDate}
                            margin={{ left: 12, right: 12, top: 20, bottom: 20 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 5)}
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
                                dataKey="value"
                                type="monotone"
                                stroke="var(--color-value)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-value)",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <BarChartBig className="mr-2 h-5 w-5 text-primary" />
                        Top 10 Produtos Mais Vendidos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={productsChartConfig} className="min-h-[300px] w-full">
                        <BarChart
                            accessibilityLayer
                            data={topProducts}
                            layout="vertical"
                            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        >
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                width={100}
                                tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                            />
                            <XAxis type="number" hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
