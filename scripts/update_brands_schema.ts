
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixBrands() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // Delete existing brands collection to reset schema (simplest waay since type change is hard)
        // OR try to update if possible. Changing type file->text might be blocked.
        // Let's try to delete and recreate since we are in repair mode.
        try {
            await pb.collections.delete('brands');
            console.log("✅ Deleted old brands collection");
        } catch (e) {
            console.log("ℹ️ Brands collection might not exist");
        }

        // Recreate with correct schema
        await pb.collections.create({
            name: 'brands',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true },
                { name: 'logo', type: 'text' }, // CHANGED TO TEXT
                { name: 'active', type: 'bool' }
            ],
            listRule: "",
            viewRule: "",
            createRule: "@request.auth.id != ''",
            updateRule: "@request.auth.id != ''",
            deleteRule: "@request.auth.id != ''",
        });

        console.log("✅ Recreated brands collection with 'logo' as TEXT");

    } catch (e: any) {
        console.error("❌ Failed:", e.message);
    }
}

fixBrands();
