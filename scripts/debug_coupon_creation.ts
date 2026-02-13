
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugCouponCreation() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // 1. Simulate Payload matching src/actions/coupons.ts
        const payload = {
            code: "TESTDEBUG" + Date.now(),
            discount_type: "percent",
            discount_value: 10,
            expiration_date: new Date(Date.now() + 86400000).toISOString(),
            usage_limit: 100,
            active: true,
            partner_name: "Test Partner",
            usage_count: 0 // Schema has usage_count
        };

        console.log("Sending Payload:", JSON.stringify(payload, null, 2));

        const record = await pb.collection('coupons').create(payload);
        console.log("✅ Success! Created", record.id);

        // cleanup
        await pb.collection('coupons').delete(record.id);
        console.log("✅ Cleanup (deleted record)");

    } catch (e: any) {
        console.error("❌ FAILURE RESPONSE:");
        console.error("Status:", e.status);
        console.error("Message:", e.message);
        console.error("Data:", JSON.stringify(e.data, null, 2));
    }
}

debugCouponCreation();
