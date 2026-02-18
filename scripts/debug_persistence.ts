import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugPersistence() {
    console.log("🔍 Debugging Banner Persistence...");

    const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.darkstoresuplementos.com/';
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("❌ Missing env vars");
        return;
    }

    try {
        const pb = new PocketBase(url);
        await pb.admins.authWithPassword(email, password);
        console.log("✅ Authenticated as Admin");

        console.log("Attempting getList(1, 10)...");
        const listResult = await pb.collection('promotions').getList(1, 10);
        console.log(`✅ getList success! Found ${listResult.totalItems} items.`);
        const records = listResult.items;

        // const records = await pb.collection('promotions').getFullList({
        //     sort: '-created'
        // });

        console.log(`📊 Found ${records.length} banners in DB.`);

        if (records.length > 0) {
            console.log("📝 Latest Banner:", JSON.stringify(records[0], null, 2));
        } else {
            console.warn("⚠️ No banners found! Persistence is likely failing.");
        }

    } catch (e: any) {
        console.error("❌ Error fetching banners:", e.message);
        if (e.response) console.error("Response:", e.response);
    }
}

debugPersistence();
