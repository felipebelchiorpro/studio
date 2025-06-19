
// import { redirect } from 'next/navigation'; // No longer redirecting

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, DollarSign, Package, Users } from "lucide-react";

export default async function DashboardOverviewPage() {
  // redirect('/dashboard/products'); // Removed redirect

  // Placeholder data - replace with actual data fetching later
  const totalRevenue = 12550.75;
  const totalOrders = 88;
  const totalProducts = 72;
  const totalCustomers = 123;


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
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2).replace('.',',')}</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado (simulado)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+15% em relação ao mês passado (simulado)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Cadastrados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
             <p className="text-xs text-muted-foreground">+5 novos produtos esta semana (simulado)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+10% novos clientes (simulado)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes (Simulado)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent sales chart or list */}
            <p className="text-muted-foreground">Gráfico de vendas recentes aparecerá aqui.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos (Simulado)</CardTitle>
          </CardHeader>
          <CardContent>
             {/* Placeholder for top products list */}
            <p className="text-muted-foreground">Lista de produtos mais vendidos aparecerá aqui.</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
