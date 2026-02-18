
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testFlavorStock() {
    console.log("🧪 Testing Flavor Stock Persistence...");

    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Authenticated");

        const testFlavorData = [
            { flavor: "Chocolate Test", stock: 15, image: "" },
            { flavor: "Vanilla Test", stock: 8, image: "" }
        ];

        // 1. Get a category
        const category = await pb.collection('categories').getFirstListItem('');
        console.log("📂 Using Category:", category.id);

        const payload = {
            name: "Test Flavor Stock Product",
            slug: "test-flavor-stock-product-" + Date.now(),
            description: "Testing flavor stock persistence",
            price: 99.90,
            category: category.id,
            flavor_details: testFlavorData, // This is the field we added
            flavors: ["Chocolate Test", "Vanilla Test"], // Legacy field
            active: true
        };

        console.log("📤 Creating product with flavors:", testFlavorData);
        const record = await pb.collection('products').create(payload);
        console.log("✅ Product Created ID:", record.id);

        console.log("📥 Fetching product back...");
        const fetchedRecord = await pb.collection('products').getOne(record.id);

        console.log("🔍 Verifying flavor_details...");
        console.log("Stored Data:", fetchedRecord.flavor_details);

        const storedDetails = fetchedRecord.flavor_details;

        if (Array.isArray(storedDetails) && storedDetails.length === 2) {
            if (storedDetails[0].stock === 15 && storedDetails[1].stock === 8) {
                console.log("✅ SUCCESS: Stock values persisted correctly!");
            } else {
                console.log("❌ FAILURE: Stock values mismatch.");
            }
        } else {
            console.log("❌ FAILURE: flavor_details is not an array or has wrong length.");
        }

        // Cleanup
        await pb.collection('products').delete(record.id);
        console.log("🧹 Cleanup: Test product deleted.");

    } catch (e: any) {
        console.error("❌ Error:", e.response?.data || e.message);
    }
}

testFlavorStock();
