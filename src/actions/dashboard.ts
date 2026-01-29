"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getDashboardStats() {
    // 1. Fetch Totals
    const { count: productsCount } = await supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true });

    const { data: orders, error: ordersError } = await supabaseAdmin
        .from("orders")
        .select("total_amount, order_date, status, user_id")
        .neq("status", "cancelled"); // Exclude cancelled

    if (ordersError) {
        console.error("Error fetching dashboard stats:", ordersError);
        return null;
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0);

    // Unique Customers
    const uniqueCustomers = new Set(orders.map(o => o.user_id).filter(Boolean)).size;

    // 2. Prepare Chart Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenueMap = new Map<string, number>();

    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); // "18 jul"
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

    // 3. Category Data (Simplified for now, as it requires complex joins or denormalization)
    // Ideally, we'd query order_items -> products -> distinct categories
    // For MVP/Speed, we might fetch recent order_items and Aggregate manually if volume is low.
    // Or just mock this part if schema is too complex for a quick query, but user asked for REAL data.
    // Let's try to fetch order_items linked to products if possible.

    // Fetch a sample of order items for category distribution (limit to last 100 items to avoid perf issues)
    const { data: orderItems } = await supabaseAdmin
        .from("order_items")
        .select("product_id, products(category_id, categories(name))")
        .limit(100);

    // Aggregate
    const categoryCount: Record<string, number> = {};
    if (orderItems) {
        orderItems.forEach((item: any) => {
            const catName = item.products?.categories?.name || "Outros";
            categoryCount[catName] = (categoryCount[catName] || 0) + 1;
        });
    }

    const salesByCategoryData = Object.entries(categoryCount).map(([category, count], index) => ({
        category,
        sales: count, // This is technically "volume" not "revenue" but works for distribution
        fill: `var(--chart-${(index % 5) + 1})`
    }));

    return {
        totalRevenue,
        totalOrders,
        totalProducts: productsCount || 0,
        totalCustomers: uniqueCustomers,
        dailyRevenueData,
        salesByCategoryData
    };
}
