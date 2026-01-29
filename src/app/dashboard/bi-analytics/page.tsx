import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, DollarSign, ShoppingCart, Percent, Users2 } from "lucide-react";
import { subDays } from "date-fns";
import { getAnalyticsData } from "@/actions/analytics";
import { AnalyticsFilters } from "@/components/dashboard/AnalyticsFilters";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";

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

export default async function BiAnalyticsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const from = typeof searchParams.from === 'string' ? new Date(searchParams.from) : undefined;
  const to = typeof searchParams.to === 'string' ? new Date(searchParams.to) : undefined;

  const data = await getAnalyticsData({
    from: from || subDays(new Date(), 30),
    to: to || new Date()
  });

  if (!data) {
    return <div className="p-8">Erro ao carregar dados de analytics.</div>;
  }

  const { kpis, charts, recentOrders } = data;

  const kpiCards: KeyMetricCardProps[] = [
    { title: "Receita Total", value: `R$ ${kpis.totalRevenue.toFixed(2).replace('.', ',')}`, icon: DollarSign, change: "+0%", changeType: "positive" },
    { title: "Ticket Médio", value: `R$ ${kpis.averageTicket.toFixed(2).replace('.', ',')}`, icon: ShoppingCart, change: "+0%", changeType: "positive" },
    { title: "Novos Clientes", value: kpis.newCustomers.toString(), icon: Users2, change: "+0%", changeType: "positive" },
    { title: "Taxa de Conversão (Simulado)", value: "3.45%", icon: Percent, change: "-0.5%", changeType: "negative" },
    { title: "Total de Pedidos", value: kpis.totalOrders.toString(), icon: ShoppingCart, change: "+0%", changeType: "positive" },
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

      <AnalyticsFilters />

      {/* KPIs Section */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {kpiCards.map(kpi => <KeyMetricCard key={kpi.title} {...kpi} />)}
      </div>

      <AnalyticsCharts salesByDate={charts.salesByDate} topProducts={charts.topProducts} />

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
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
