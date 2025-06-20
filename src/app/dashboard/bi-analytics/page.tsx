
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart as LineChartIcon, BarChartBig, Users, MapPin, CalendarDays, Filter, Download, TrendingUp, DollarSign, ShoppingCart, Percent, Users2, PieChart as PieChartLucide } from "lucide-react";
// Chart-specific imports are commented out or removed if not used by placeholders
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   ChartLegend,
//   ChartLegendContent,
//   type ChartConfig
// } from "@/components/ui/chart";
// import {
//   LineChart,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   Legend as RechartsLegend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell
// } from "recharts";
import type { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { mockCategories, biDashboardSalesChannels, biDashboardStates } from "@/data/mockData";

interface KeyMetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon: React.ElementType;
}

const KeyMetricCard: React.FC<KeyMetricCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p className={`text-xs mt-1 ${changeType === "positive" ? "text-green-500" : "text-red-500"}`}>
            {change} vs período anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const recentOrdersData = [
  { id: "ORD001", date: "2024-07-28", customer: "Carlos Silva", total: "R$ 129,90", status: "Entregue", channel: "Loja Online" },
  { id: "ORD002", date: "2024-07-28", customer: "Ana Pereira", total: "R$ 79,90", status: "Enviado", channel: "Instagram" },
  { id: "ORD003", date: "2024-07-27", customer: "Lucas Martins", total: "R$ 245,50", status: "Pendente", channel: "Loja Online" },
  { id: "ORD004", date: "2024-07-26", customer: "Mariana Costa", total: "R$ 59,90", status: "Entregue", channel: "Loja Física" },
];

export default function BiAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const kpis: KeyMetricCardProps[] = [
    { title: "Receita Total", value: "R$ 1.250.340", icon: DollarSign, change: "+15.2%", changeType: "positive" },
    { title: "Ticket Médio", value: "R$ 285,70", icon: ShoppingCart, change: "+2.1%", changeType: "positive" },
    { title: "Novos Clientes", value: "1.280", icon: Users2, change: "+8.5%", changeType: "positive" },
    { title: "Taxa de Conversão", value: "3.45%", icon: Percent, change: "-0.5%", changeType: "negative" },
    { title: "Total de Pedidos", value: "4.378", icon: ShoppingCart, change: "+12.0%", changeType: "positive" },
  ];

  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case 'Entregue': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50';
      case 'Enviado': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50';
      case 'Pendente': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="font-headline text-3xl font-bold text-foreground">BI Analytics Dashboard</h1>
        <Button variant="outline" className="mt-2 sm:mt-0">
          <Download className="mr-2 h-4 w-4" /> Exportar Dados (Simulado)
        </Button>
      </div>

      {/* 1. Global Filters Bar */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><Filter className="mr-2 h-5 w-5 text-primary" />Filtros Globais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "LLL dd, y", { locale: ptBR })} - ${format(dateRange.to, "LLL dd, y", { locale: ptBR })}`
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: ptBR })
                  )
                ) : (
                  <span>Escolha um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Select>
            <SelectTrigger><SelectValue placeholder="Canal de Venda" /></SelectTrigger>
            <SelectContent>
              {biDashboardSalesChannels.map(channel => <SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Categoria de Produto" /></SelectTrigger>
            <SelectContent>
              {mockCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              {biDashboardStates.map(state => <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>)}
            </SelectContent>
          </Select>
           <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-10">Aplicar Filtros</Button>
        </CardContent>
      </Card>

      {/* 2. KPIs Section */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {kpis.map(kpi => <KeyMetricCard key={kpi.title} {...kpi} />)}
      </div>

      {/* 3. Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><LineChartIcon className="mr-2 h-5 w-5 text-primary" />Análise de Vendas ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md border border-dashed">
            <p className="text-muted-foreground">Visualização de gráfico de linha aqui.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><BarChartBig className="mr-2 h-5 w-5 text-primary" />Top 10 Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md border border-dashed">
             <p className="text-muted-foreground">Visualização de gráfico de barras aqui.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><PieChartLucide className="mr-2 h-5 w-5 text-primary" />Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md border border-dashed">
            <p className="text-muted-foreground">Visualização de gráfico de pizza aqui.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><Users className="mr-2 h-5 w-5 text-primary" />Aquisição de Novos Clientes</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md border border-dashed">
             <p className="text-muted-foreground">Visualização de gráfico de linha/barras aqui.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><MapPin className="mr-2 h-5 w-5 text-primary" />Vendas por Região (Simulado)</CardTitle>
          <CardDescription>Distribuição geográfica das vendas.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md border border-dashed">
          <p className="text-muted-foreground">Visualização de Mapa de Calor Geográfico aqui.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Tabela de Dados Detalhada: Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Canal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrdersData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="text-right">{order.total}</TableCell>
                  <TableCell className="text-center">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColorClass(order.status)}`}>
                        {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.channel}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Basic Pagination Placeholder */}
          <div className="flex justify-center mt-4">
            <Button variant="outline" size="sm" className="mr-2">Anterior</Button>
            <Button variant="outline" size="sm">Próxima</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    