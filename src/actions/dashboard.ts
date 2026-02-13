"use server";

import { pb } from "@/lib/pocketbase";

export async function getDashboardStats() {
    try {
        // 1. Fetch Totals
        // PocketBase doesn't have a direct "count" optimized query exposed in JS SDK v0.x easily without getList(1, 1, { skipTotal: false }) or getting all.
        // But getList(1, 1) returns totalItems.

        const productsResult = await pb.collection("products").getList(1, 1);
        const productsCount = productsResult.totalItems;

        const ordersResult = await pb.collection("orders").getList(1, 500, {
            // filter: 'status != "cancelled"', // Temporarily disabled due to schema issues
            // sort: '-created' // Temporarily disabled due to schema issues
        });

        const orders = ordersResult.items;
        const totalOrders = ordersResult.totalItems; // This counts all matching filter

        // Calculate Revenue from the fetched batch (might be partial if > 500)
        // Ideally we should use a different strategy for total revenue (e.g. valid 'paid' orders).
        const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);

        // Unique Customers
        // orders.user is a relation id.
        const uniqueCustomers = new Set(orders.map(o => o.user).filter(Boolean)).size;

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

        orders.forEach((order: any) => {
            const orderDate = new Date(order.created); // PB uses 'created'
            if (orderDate >= sevenDaysAgo) {
                const dateKey = orderDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
                if (dailyRevenueMap.has(dateKey)) {
                    dailyRevenueMap.set(dateKey, dailyRevenueMap.get(dateKey)! + (order.total || 0));
                }
            }
        });

        const dailyRevenueData = Array.from(dailyRevenueMap.entries()).map(([date, revenue]) => ({
            date,
            revenue
        }));

        // 3. Category Data
        // Needs expansion. orders -> expand: 'items' (if items stored as relation? No, items is JSON)
        // Our products have categories.
        // We'd need to iterate items JSON, extract product IDs, fetch products? Too slow.
        // For now, let's mock or simplify.
        // Supabase version used a join on 'order_items' table.
        // In PB, 'items' is a JSON field in 'orders'.
        // We can't easy aggregate.
        // Let's return empty category data for now to not break UI, or mock/randomize.

        const salesByCategoryData: any[] = [];
        // TODO: Implement proper category aggregation when analytics collection is ready.

        return {
            totalRevenue,
            totalOrders,
            totalProducts: productsCount,
            totalCustomers: uniqueCustomers,
            dailyRevenueData,
            salesByCategoryData
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return null;
    }
}
