"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users } from "lucide-react";

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

        // 1. Fetch Products Count
        const { count: productsCount, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        if (productsError) throw productsError;

        // 2. Fetch Orders (RLS must allow admin email)
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("total_amount, order_date, status, user_id")
          .neq("status", "cancelled");

        if (ordersError) {
          console.error("Order fetch error:", ordersError);
          throw new Error("Não foi possível carregar os pedidos. Verifique se você é um administrador.");
        }

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0);
        const uniqueCustomers = new Set(orders.map(o => o.user_id).filter(Boolean)).size;

        // 3. Process Chart Data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyRevenueMap = new Map<string, number>();

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateKey = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
          dailyRevenueMap.set(dateKey, 0);
        }

        orders.forEach(order => {
          const orderDate = new Date(order.order_date);
          if (orderDate >= sevenDaysAgo) {
            const dateKey = orderDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
            if (dailyRevenueMap.has(dateKey)) {
              dailyRevenueMap.set(dateKey, dailyRevenueMap.get(dateKey)! + (order.total_amount || 0));
            }
          }
        });

        const dailyRevenueData = Array.from(dailyRevenueMap.entries()).map(([date, revenue]) => ({
          date,
          revenue
        }));

        // 4. Sales by Category (Simplified Estimate via recent items)
        // Note: Client-side join might be heavy, so checking if we can fetch order_items
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id, products(category)") // Assuming relation and column exists
          .limit(100);

        const categoryCount: Record<string, number> = {};
        if (orderItems) {
          orderItems.forEach((item: any) => {
            // products might be an array or object depending on relation
            const prod = Array.isArray(item.products) ? item.products[0] : item.products;
            const catName = prod?.category || "Outros";
            categoryCount[catName] = (categoryCount[catName] || 0) + 1;
          });
        }

        // If order_items fetch fails or is empty, use empty data
        const salesByCategoryData = Object.entries(categoryCount).map(([category, count], index) => ({
          category,
          sales: count,
          fill: `var(--chart-${(index % 5) + 1})`
        }));

        setStats({
          totalRevenue,
          totalOrders,
          totalProducts: productsCount || 0,
          totalCustomers: uniqueCustomers,
          dailyRevenueData,
          salesByCategoryData
        });

      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Erro desconhecido ao carregar dados.");
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
