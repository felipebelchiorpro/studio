
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateSchemas() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // 1. Shipping Rates: Add 'state'
        try {
            const col = await pb.collections.getOne('shipping_rates');
            const fields = (col as any).fields;
            if (!fields.find((f: any) => f.name === 'state')) {
                fields.push({
                    name: "state",
                    type: "text",
                    required: false // Optional for now
                });
                await pb.collections.update(col.id, { fields });
                console.log("✅ Added 'state' to shipping_rates");
            } else {
                console.log("ℹ️ 'state' already exists in shipping_rates");
            }
        } catch (e: any) {
            console.error("❌ Failed shipping_rates:", e.message);
        }

        // 2. Partners: Add 'code' and 'score'
        try {
            const col = await pb.collections.getOne('partners');
            const fields = (col as any).fields;
            let changed = false;

            if (!fields.find((f: any) => f.name === 'code')) {
                fields.push({
                    name: "code",
                    type: "text",
                    required: true,
                    unique: true
                });
                changed = true;
            }
            if (!fields.find((f: any) => f.name === 'score')) {
                fields.push({
                    name: "score",
                    type: "number"
                });
                changed = true;
            }

            if (changed) {
                await pb.collections.update(col.id, { fields });
                console.log("✅ Added 'code'/'score' to partners");
            } else {
                console.log("ℹ️ 'code'/'score' already exists in partners");
            }
        } catch (e: any) {
            console.error("❌ Failed partners:", e.message);
        }

    } catch (e: any) {
        console.error(e);
    }
}

updateSchemas();
