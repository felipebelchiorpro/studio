
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateProductsSchema() {
    console.log("🔧 Starting Products Schema Update for Flavors...");

    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("❌ Credentials missing in .env.local");
        return;
    }

    try {
        await pb.admins.authWithPassword(email, password);
        console.log("✅ Authenticated as Admin");

        const collection = await pb.collections.getOne('products');
        let fields = (collection as any).fields || [];

        // Check if flavor_details already exists
        const fieldName = 'flavor_details';
        const existingField = fields.find((f: any) => f.name === fieldName);

        if (existingField) {
            console.log(`ℹ️ Field '${fieldName}' already exists.`);
        } else {
            console.log(`➕ Adding '${fieldName}' field...`);
            fields.push({
                name: fieldName,
                type: 'json',
                required: false,
                presentable: false
            });

            await pb.collections.update(collection.id, { fields: fields });
            console.log("✅ Schema updated successfully!");
        }

    } catch (e: any) {
        console.error("❌ Error updating schema:", e.response?.data || e.message);
    }
}

updateProductsSchema();
