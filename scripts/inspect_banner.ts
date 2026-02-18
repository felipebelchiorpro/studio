
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function inspectBannerStructure() {
    console.log("🔍 Inspecting Banner Structure...");

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
        console.log("✅ Authenticated");

        // Try to create with BOTH name and title to see what sticks
        const payload = {
            name: "Test Name " + Date.now(),
            title: "Test Title " + Date.now(),
            description: "Test Description",
            image_url: "https://placehold.co/600x400.png",
            active: true
        };

        console.log("📤 Sending payload:", payload);
        const record = await pb.collection('promotions').create(payload);

        console.log("✅ Record Created!");
        console.log("📄 Full Record JSON:", JSON.stringify(record, null, 2));

        // Cleanup
        await pb.collection('promotions').delete(record.id);
        console.log("🧹 Cleanup done.");

    } catch (e: any) {
        console.error("❌ Error:", e.message);
        if (e.response) {
            console.error("❌ Response Data:", JSON.stringify(e.response, null, 2));
        }
    }
}

inspectBannerStructure();
