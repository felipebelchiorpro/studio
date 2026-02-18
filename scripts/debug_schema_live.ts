
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugSchema() {
    console.log("🔍 Starting Live Schema Debug...");

    // 1. Authenticate
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("❌ Credentials missing in .env.local");
        return;
    }

    try {
        await pb.admins.authWithPassword(email, password);
        console.log("✅ Authenticated as Admin");
    } catch (e: any) {
        console.error("❌ Auth failed:", e.message);
        return;
    }

    // 2. Check Promotions Schema
    try {
        console.log("\n📦 Checking 'promotions' collection...");
        const collection = await pb.collections.getOne('promotions');
        console.log("Schema Fields:", (collection as any).fields?.map((f: any) => `${f.name} (${f.type})`).join(', ') || "No fields found");

        // Try creating a dummy record
        console.log("🧪 Attempting to create dummy promotion...");
        const dummyData = {
            name: "Debug Banner 2", // Changed title -> name
            description: "Test",
            active: true,
            position: "main_carousel",
            // image_url: "", // Optional
        };
        const record = await pb.collection('promotions').create(dummyData);
        console.log("✅ Create Success! ID:", record.id);
        await pb.collection('promotions').delete(record.id);
        console.log("✅ Delete Success!");
    } catch (e: any) {
        console.error("❌ Promotions Error:", e.response?.data || e.message);
    }

    // 3. Check Integration Settings Schema
    try {
        console.log("\n⚙️ Checking 'integration_settings' collection...");
        const collection = await pb.collections.getOne('integration_settings');
        console.log("Schema Fields:", (collection as any).fields?.map((f: any) => `${f.name} (${f.type})`).join(', ') || "No fields found");

        // Try to update or create
        console.log("🧪 Attempting to fetch singleton...");
        let settingsId;
        try {
            const list = await pb.collection('integration_settings').getList(1, 1);
            if (list.items.length > 0) {
                settingsId = list.items[0].id;
                console.log("Found existing settings ID:", settingsId);
            }
        } catch (e) {
            console.log("No existing settings found.");
        }

        if (settingsId) {
            const updateData = { mp_public_key: "debug_test_key_updated" };
            await pb.collection('integration_settings').update(settingsId, updateData);
            console.log("✅ Update Success!");
        } else {
            const createData = {
                provider: 'general', // Added provider
                store_address: "Debug Address",
                mp_public_key: "debug_key",
                status_order_created: true
            };
            const rec = await pb.collection('integration_settings').create(createData);
            console.log("✅ Create Success! ID:", rec.id);
            // Don't delete settings, keep it
        }

    } catch (e: any) {
        console.error("❌ Integration Settings Error:", e.response?.data || e.message);
    }
}

debugSchema();
