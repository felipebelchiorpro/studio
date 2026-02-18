
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function inspectUsersSchema() {
    console.log("🔍 Inspecting 'users' schema...");

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

        const collection = await pb.collections.getOne('users');
        console.log("Users Collection Schema:", JSON.stringify(collection.fields || collection.schema, null, 2));

    } catch (e: any) {
        console.error("❌ Error:", e.message);
    }
}

inspectUsersSchema();
