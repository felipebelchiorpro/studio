
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function ensureBannerTitleField() {
    console.log("🔍 Checking 'promotions' schema for 'title' field...");

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

        const collection = await pb.collections.getOne('promotions');
        console.log("📦 Collection structure:", JSON.stringify(collection, null, 2));

        // PB 0.23+ uses 'fields' array
        const fields = collection.fields || collection.schema;
        const hasTitle = fields.some((field: any) => field.name === 'title');

        if (hasTitle) {
            console.log("✅ 'title' field already exists.");
        } else {
            console.log("⚠️ 'title' field missing. Adding it now...");

            // Add title field
            fields.push({
                "system": false,
                "id": "title_field_id_" + Date.now(),
                "name": "title",
                "type": "text",
                "required": false,
                "presentable": false,
                "unique": false,
                "options": {
                    "min": null,
                    "max": null,
                    "pattern": ""
                }
            });

            // Update collection with new fields
            if (collection.fields) {
                collection.fields = fields;
            } else {
                collection.schema = fields;
            }

            await pb.collections.update(collection.id, collection);
            console.log("✅ Schema updated successfully: Added 'title' field.");
        }

    } catch (e: any) {
        console.error("❌ Error updating schema:", e.message);
        if (e.response) console.error("Response:", JSON.stringify(e.response, null, 2));
    }
}

ensureBannerTitleField();
