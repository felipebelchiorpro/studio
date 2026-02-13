
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testAdminLogin() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    console.log(`Testing Admin Login for: ${email}`);

    if (!email || !password) {
        console.error("Missing Admin Credentials in .env.local");
        return;
    }

    try {
        const authData = await pb.admins.authWithPassword(email, password);
        console.log("✅ Admin Login Successful!");
        console.log("Auth Data Keys:", Object.keys(authData));
        // PocketBase v0.23+ might return { token, admin } or { token, record } depending on version/updates.
        // Actually, for admins it returns { token, admin: AdminModel }
        console.log("Admin Data:", authData.admin || authData.record);
    } catch (error: any) {
        console.error("❌ Admin Login Failed:", error.message);
        console.error("Details:", error.originalError || error);
    }
}

testAdminLogin();
