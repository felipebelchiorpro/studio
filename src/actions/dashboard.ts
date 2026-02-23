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
        sevenDaysAgo.setHours(0, 0, 0, 0); // Start of day 7 days ago
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Keep it exactly a 7-day window including today

        const dailyRevenueMap = new Map<string, number>();
        const categorySalesMap = new Map<string, number>();

        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            dailyRevenueMap.set(dateKey, 0);
        }

        orders.forEach((order: any) => {
            const orderDate = new Date(order.created);

            // Only aggregate if within the last 7 days window
            if (orderDate >= sevenDaysAgo) {
                const dateKey = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
                if (dailyRevenueMap.has(dateKey)) {
                    dailyRevenueMap.set(dateKey, dailyRevenueMap.get(dateKey)! + (order.total || 0));
                }
            }

            // Category Aggregation
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const cat = item.category || 'Outros';
                    const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                    categorySalesMap.set(cat, (categorySalesMap.get(cat) || 0) + itemTotal);
                });
            }
        });

        const dailyRevenueData = Array.from(dailyRevenueMap.entries()).map(([date, revenue]) => ({
            date,
            revenue
        }));

        const salesByCategoryData = Array.from(categorySalesMap.entries()).map(([name, value]) => ({
            name,
            value
        }));

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
