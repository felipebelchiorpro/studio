
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugDashboardFetch() {
    console.log("🔍 Simulating Dashboard Fetch...");

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

        // Exact logic from src/app/actions/promotions.ts
        const records = await pb.collection('promotions').getFullList();

        console.log(`📊 Found ${records.length} records.`);

        const mapped = records.map((p: any) => ({
            id: p.id,
            title: p.name,
            description: p.description,
            // imageUrl: getImageUrl(p), // Simplified for debug
            mobileImageUrl: p.mobile_image_url || '',
            link: p.link || '',
            position: p.position || 'main_carousel',
            active: p.active
        }));

        if (mapped.length > 0) {
            console.log("📝 First Mapped Item:", JSON.stringify(mapped[0], null, 2));
            if (!mapped[0].title) {
                console.error("❌ CRITICAL: Title is undefined! Mapping failed.");
            } else {
                console.log("✅ Title is present:", mapped[0].title);
            }
        } else {
            console.warn("⚠️ No records found.");
        }

    } catch (e: any) {
        console.error("❌ Error fetching promotions:", e.message);
        if (e.response) console.error("Response:", e.response);
    }
}

debugDashboardFetch();
