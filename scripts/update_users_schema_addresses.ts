
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateUsersSchema() {
    console.log("🔍 Updating 'users' schema...");

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
        const fields = collection.fields || collection.schema;

        // Check if 'addresses' field exists
        const addressField = fields.find((f: any) => f.name === 'addresses');

        if (!addressField) {
            console.log("⚠️ 'addresses' field missing. Adding it...");

            fields.push({
                "system": false,
                "id": "field_addresses_" + Date.now(),
                "name": "addresses",
                "type": "json",
                "required": false,
                "presentable": false,
                "unique": false,
                "options": {
                    "maxSize": 2000000 // 2MB limit
                }
            });

            if (collection.fields) {
                collection.fields = fields;
            } else {
                collection.schema = fields;
            }

            await pb.collections.update(collection.id, collection);
            console.log("✅ Schema updated: 'addresses' field added.");
        } else {
            console.log("✅ 'addresses' field already exists.");
        }

    } catch (e: any) {
        console.error("❌ Error updating schema:", e.message);
        if (e.response) console.error("Response:", JSON.stringify(e.response, null, 2));
    }
}

updateUsersSchema();
