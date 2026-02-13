
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function forceDeleteBrands() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // First, check if collection exists
        try {
            await pb.collections.getOne('brands');
            console.log("ℹ️ Brands collection exists. Attempting to delete...");
            await pb.collections.delete('brands');
            console.log("✅ Deleted brands collection");
        } catch (e: any) {
            console.log("ℹ️ Fetch/Delete error (maybe already gone):", e.message);
        }

        // Wait a bit
        await new Promise(r => setTimeout(r, 2000));

        // Create
        console.log("Constructing new brands collection...");
        await pb.collections.create({
            name: 'brands',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true },
                { name: 'logo', type: 'text' }, // Text for URL
                { name: 'active', type: 'bool' }
            ],
            listRule: "",
            viewRule: "",
        });

        console.log("✅ Recreated brands collection successfully");

    } catch (e: any) {
        console.error("❌ FINAL ERROR:", e.message);
        console.error(e.data);
    }
}

forceDeleteBrands();
