
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixProducts() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // Delete existing products collection to reset schema
        try {
            await pb.collections.delete('products');
            console.log("✅ Deleted old products collection");
        } catch (e) {
            console.log("ℹ️ Products collection might not exist");
        }

        // Recreate with correct schema (image as text for URL)
        await pb.collections.create({
            name: 'products',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true },
                { name: 'description', type: 'editor' },
                { name: 'price', type: 'number', required: true },
                { name: 'original_price', type: 'number' },
                { name: 'stock', type: 'number' },
                { name: 'category', type: 'relation', collectionId: 'categories', maxSelect: 1 },
                { name: 'brand', type: 'relation', collectionId: 'brands', maxSelect: 1 },
                { name: 'image', type: 'text' }, // CHANGED TO TEXT to store URL
                { name: 'hover_image_url', type: 'text' },
                { name: 'featured', type: 'bool' },
                { name: 'sizes', type: 'json' },
                { name: 'flavors', type: 'json' },
                { name: 'active', type: 'bool' }
            ],
            listRule: "",
            viewRule: "",
            createRule: "@request.auth.id != ''",
            updateRule: "@request.auth.id != ''",
            deleteRule: "@request.auth.id != ''",
        });

        console.log("✅ Recreated products collection with 'image' as TEXT");

    } catch (e: any) {
        console.error("❌ Failed:", e.message);
    }
}

fixProducts();
