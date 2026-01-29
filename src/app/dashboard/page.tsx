import { getDashboardStats } from "@/actions/dashboard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users } from "lucide-react";

export default async function DashboardOverviewPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return <div className="p-8">Erro ao carregar dados do dashboard. Verifique sua conexão.</div>;
  }

  const { totalRevenue, totalOrders, totalProducts, totalCustomers, dailyRevenueData, salesByCategoryData } = stats;

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold text-foreground">Visão Geral</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">Valor total acumulado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Pedidos realizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Cadastrados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Itens no catálogo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Compradores únicos</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts
        dailyRevenueData={dailyRevenueData}
        salesByCategoryData={salesByCategoryData}
      />
    </div>
  );
}
