
import PocketBase from 'pocketbase';

async function checkPublicProducts() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    // No auth - simulating public user

    try {
        console.log("🔍 Attempting to fetch products (public)...");
        const list = await pb.collection('products').getList(1, 10);

        console.log(`✅ Found ${list.totalItems} products.`);
        if (list.totalItems > 0) {
            console.log("First item:", JSON.stringify(list.items[0], null, 2));
        } else {
            console.log("⚠️ No products found. Check 'listRule' or if database is empty.");
        }

    } catch (e: any) {
        console.error("❌ Failed public fetch:", e.status, e.message);
        console.error("This usually means 'listRule' is not empty (null or restricted).");
    }
}

checkPublicProducts();
