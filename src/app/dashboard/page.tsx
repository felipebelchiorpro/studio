"use client";

import React, { useEffect, useState } from 'react';
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users } from "lucide-react";
import { getDashboardStats } from "@/actions/dashboard";

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    dailyRevenueData: [] as any[],
    salesByCategoryData: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getDashboardStats();

        if (data) {
          setStats({
            totalRevenue: data.totalRevenue,
            totalOrders: data.totalOrders,
            totalProducts: data.totalProducts,
            totalCustomers: data.totalCustomers,
            dailyRevenueData: data.dailyRevenueData,
            salesByCategoryData: data.salesByCategoryData
          });
        } else {
          setError("Não foi possível carregar os dados.");
        }

      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(`Erro ao carregar dados: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Carregando dados do dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Erro: {error}</div>;
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
