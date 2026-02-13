
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setPublicRules() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("Missing Admin Credentials");
        return;
    }

    try {
        await pb.admins.authWithPassword(email, password);
        console.log("✅ Admin Login Successful");

        const publicCollections = [
            'categories',
            'brands',
            'products',
            'promotions',
            'shipping_rates',
            'partners'
        ];

        for (const name of publicCollections) {
            try {
                const collection = await pb.collections.getOne(name);
                await pb.collections.update(collection.id, {
                    listRule: "", // Public
                    viewRule: "", // Public
                });
                console.log(`✅ Updated rules for: ${name}`);
            } catch (err: any) {
                console.error(`❌ Failed to update ${name}:`, err.message);
            }
        }

    } catch (error: any) {
        console.error("❌ Script Failed:", error.message);
    }
}

setPublicRules();
