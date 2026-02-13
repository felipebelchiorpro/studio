
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkSchemas() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    const collectionsToCheck = [
        'users',
        'products',
        'categories', // Should be good now
        'brands',
        'orders',
        'order_items', // if exists
        'shipping_rates',
        'coupons',
        'promotions',
        'partners',
        'integration_settings',
        'store_settings'
    ];

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login Successful");

        console.log("--- Checking Schemas ---");

        for (const name of collectionsToCheck) {
            try {
                const col = await pb.collections.getOne(name);
                const fields = (col as any).fields || [];
                const fieldNames = fields.map((f: any) => f.name);

                console.log(`\n📦 Collection: ${name}`);
                console.log(`   Type: ${col.type}`);
                console.log(`   Fields (${fields.length}): ${fieldNames.join(', ')}`);

                if (fields.length <= 1 && fieldNames.includes('id')) {
                    console.error(`   ⚠️  POTENTIALLY BROKEN (Only ID found)`);
                } else {
                    console.log(`   ✅ OK`);
                }

            } catch (e: any) {
                if (e.status === 404) {
                    console.log(`\n❌ Collection: ${name} (NOT FOUND)`);
                } else {
                    console.error(`\n❌ Collection: ${name} (Error: ${e.message})`);
                }
            }
        }

    } catch (error: any) {
        console.error("❌ Script Failed:", error.message);
    }
}

checkSchemas();
