
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixMissingFields() {
    console.log("🔧 Starting Schema Fix...");

    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Authenticated");

        const col = await pb.collections.getOne('integration_settings');
        // Use 'fields' property for modern PB versions (or verify structure from debug output)
        // From debug output: "Schema Fields: id, provider, enabled..."
        // I need to add the missing ones.

        // PB JS SDK v0.20+ uses 'fields' array in update payload.
        // But if I use the object I got from getOne, it might have 'schema' (old) or 'fields' (new).
        // Debug script showed (collection as any).fields worked.

        let fields = (col as any).fields || [];

        const newFields = [
            { name: 'store_address', type: 'text' },
            { name: 'store_hours', type: 'text' }, // JSON stringified
            { name: 'webhook_order_created', type: 'text' },
            { name: 'auth_token', type: 'text' },
            { name: 'status_order_created', type: 'bool' },
            { name: 'status_abandoned_cart', type: 'bool' },
            { name: 'webhook_abandoned_cart', type: 'text' }
        ];

        let changed = false;
        newFields.forEach(nf => {
            if (!fields.find((f: any) => f.name === nf.name)) {
                console.log(`➕ Adding '${nf.name}'...`);
                fields.push(nf);
                changed = true;
            }
        });

        // Also check if 'provider' is required. If existing data doesn't have it, we might have issues?
        // No, we are just adding fields.

        if (changed) {
            await pb.collections.update(col.id, { fields: fields });
            console.log("✅ Updated 'integration_settings' schema with missing fields.");
        } else {
            console.log("👌 'integration_settings' already has all fields.");
        }

    } catch (e: any) {
        console.error("❌ Error:", e.response?.data || e.message);
    }
}

fixMissingFields();
