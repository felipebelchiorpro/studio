
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function ensureProductFields() {
    console.log("🔍 Checking 'products' schema...");

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

        const collection = await pb.collections.getOne('products');

        // PB 0.23+ uses 'fields' array, older uses 'schema'
        const fields = collection.fields || collection.schema;

        const missingFields = [];

        // Check original_price
        if (!fields.some((f: any) => f.name === 'original_price')) {
            console.log("⚠️ 'original_price' field missing.");
            missingFields.push({
                "system": false,
                "id": "field_original_price_" + Date.now(),
                "name": "original_price",
                "type": "number",
                "required": false,
                "presentable": false,
                "unique": false,
                "options": {
                    "min": null,
                    "max": null,
                    "noDecimal": false
                }
            });
        } else {
            console.log("✅ 'original_price' field exists.");
        }

        // Check flavor_details (from previous plan, good to ensure)
        if (!fields.some((f: any) => f.name === 'flavor_details')) {
            console.log("⚠️ 'flavor_details' field missing.");
            missingFields.push({
                "system": false,
                "id": "field_flavor_details_" + Date.now(),
                "name": "flavor_details",
                "type": "json",
                "required": false,
                "presentable": false,
                "unique": false,
                "options": {
                    "maxSize": 2000000
                }
            });
        } else {
            console.log("✅ 'flavor_details' field exists.");
        }

        if (missingFields.length > 0) {
            console.log(`Adding ${missingFields.length} missing fields...`);
            fields.push(...missingFields);

            if (collection.fields) {
                collection.fields = fields;
            } else {
                collection.schema = fields;
            }

            await pb.collections.update(collection.id, collection);
            console.log("✅ Schema updated successfully!");
        } else {
            console.log("🎉 All fields are present. No changes needed.");
        }

    } catch (e: any) {
        console.error("❌ Error updating schema:", e.message);
        if (e.response) console.error("Response:", JSON.stringify(e.response, null, 2));
    }
}

ensureProductFields();
