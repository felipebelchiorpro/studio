
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugDashboard() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // 1. Fetch Products
        console.log("Fetching Products...");
        const productsResult = await pb.collection("products").getList(1, 1);
        console.log(`✅ Products Total: ${productsResult.totalItems}`);

        // 2. Fetch Orders
        console.log("Fetching Orders...");
        const ordersResult = await pb.collection("orders").getList(1, 10, {
            // filter: 'status != "cancelled"', // DEBUG: Suspect this filter is breaking
            // sort: '-created'
        });
        console.log(`✅ Orders Total: ${ordersResult.totalItems}`);
        console.log(`✅ Orders Fetched: ${ordersResult.items.length}`);

        const orders = ordersResult.items;

        // 3. Calc Revenue
        const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
        console.log(`✅ Revenue: ${totalRevenue}`);

        // 4. Unique Customers
        const uniqueCustomers = new Set(orders.map(o => o.user).filter(Boolean)).size;
        console.log(`✅ Unique Customers: ${uniqueCustomers}`);

        // 5. Daily Data
        const dailyRevenueMap = new Map<string, number>();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        orders.forEach((order: any) => {
            const orderDate = new Date(order.created);
            if (orderDate >= sevenDaysAgo) {
                const dateKey = orderDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
                console.log(`   Order Date: ${order.created} -> Key: ${dateKey} -> Val: ${order.total}`);
            }
        });

        console.log("✅ Daily Data logic seems OK (if no crash above)");

    } catch (e: any) {
        console.error("❌ ERROR:", e);
        if (e.data) console.error(JSON.stringify(e.data, null, 2));
    }
}

debugDashboard();
