"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { startOfMonth, subMonths, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getAnalyticsData(dateRange?: { from: Date; to: Date }) {
    // Default range: Last 30 days if not provided
    const toDate = dateRange?.to || new Date();
    const fromDate = dateRange?.from || new Date(new Date().setDate(toDate.getDate() - 30));

    const { data: orders, error } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*, products(*))")
        .gte("order_date", fromDate.toISOString())
        .lte("order_date", toDate.toISOString())
        .neq("status", "cancelled");

    if (error || !orders) {
        console.warn("Analytics fetch failed (expected if Service Key is missing/invalid):", JSON.stringify(error || {}, null, 2));
        // Return Safe Empty Data to prevent UI Crash
        return {
            kpis: { totalRevenue: 0, totalOrders: 0, averageTicket: 0, newCustomers: 0 },
            charts: { salesByDate: [], topProducts: [] },
            recentOrders: []
        };
    }

    // Calculate KPIs
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Unique customers (by user_id)
    const uniqueCustomers = new Set(orders.map(o => o.user_id).filter(Boolean)).size;

    // Comparison (Mock logic for now, or fetch previous period)
    // For simplicity, we'll return the current values. 
    // Should ideally fetch previous period data for "change" calculation.

    // Sales Over Time (Group by Day)
    const salesByDateMap = new Map<string, number>();
    // Initialize map with 0s for the range would be better, but dense data handling is easier for now

    orders.forEach(order => {
        const dateKey = format(parseISO(order.order_date), "dd MMM", { locale: ptBR });
        salesByDateMap.set(dateKey, (salesByDateMap.get(dateKey) || 0) + (order.total_amount || 0));
    });

    const salesByDate = Array.from(salesByDateMap.entries()).map(([date, value]) => ({
        date,
        value
    }));

    // Top Products
    const productCountMap = new Map<string, number>();
    orders.forEach(order => {
        order.order_items.forEach((item: any) => {
            const productName = item.products?.name || "Produto Desconhecido";
            productCountMap.set(productName, (productCountMap.get(productName) || 0) + (item.quantity || 1));
        });
    });

    const topProducts = Array.from(productCountMap.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10); // Top 10


    return {
        kpis: {
            totalRevenue,
            totalOrders,
            averageTicket,
            newCustomers: uniqueCustomers, // Proxy for new customers in this period
        },
        charts: {
            salesByDate,
            topProducts
        },
        recentOrders: orders.slice(0, 50).map(o => ({
            id: o.id,
            date: format(parseISO(o.order_date), "dd/MM/yyyy"),
            customer: o.user_id || "Cliente", // Replace with name if available (no email in orders)
            total: `R$ ${o.total_amount?.toFixed(2).replace('.', ',')}`,
            status: o.status,
            channel: o.channel || "Loja Online"
        }))
    };
}
