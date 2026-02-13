
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugCategories() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login Successful");

        const collection = await pb.collections.getOne('categories');
        console.log("Collection Keys:", Object.keys(collection));
        console.log("Collection Fields:", JSON.stringify((collection as any).fields, null, 2));
        console.log("Collection Schema (Old):", JSON.stringify(collection.schema, null, 2));

        console.log("Attempting getFullList without sort...");
        try {
            const records = await pb.collection('categories').getFullList();
            console.log(`✅ getFullList OK. Found ${records.length}`);
            if (records.length > 0) {
                console.log("First Record Keys:", Object.keys(records[0]));
                console.log("First Record Data:", JSON.stringify(records[0], null, 2));
            }
        } catch (err: any) {
            console.log("❌ getFullList Failed:", err.message);
        }

        console.log("Attempting getOne('hzcltfgplvlwbv')..."); // ID from screenshot
        try {
            const record = await pb.collection('categories').getOne('hzcltfgplvlwbv');
            console.log("✅ getOne OK:", record.id, record.name);
            console.log("Record Keys:", Object.keys(record));
        } catch (err: any) {
            console.log("❌ getOne Failed:", err.message);
        }

    } catch (error: any) {
        console.error("❌ Failed to fetch categories:", error.message);
        if (error.data) {
            console.error("Details:", JSON.stringify(error.data, null, 2));
        }
    }
}

debugCategories();
