
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createTestCategory() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login Successful");

        const category = {
            name: "Test Category Supplement",
            slug: "test-category-supplement",
            type: "supplement",
            // image: undefined // Optional
        };

        const record = await pb.collection('categories').create(category);
        console.log("✅ Created Test Category:", record.id, record.name);
        console.log("Record Keys:", Object.keys(record));

    } catch (error: any) {
        console.error("❌ Failed to create category:", error.message);
        if (error.data) console.error(JSON.stringify(error.data, null, 2));
    }
}

createTestCategory();
