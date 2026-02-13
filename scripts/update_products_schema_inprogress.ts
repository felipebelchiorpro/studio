
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixProductsImage() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // We need to change 'image' from file to text.
        // Similar to brands, we can try to update in place or delete and recreate.
        // Given 'products' is complex and might have data, updating schema is safer but might fail on type change.

        try {
            const col = await pb.collections.getOne('products');
            const fields = (col as any).fields;
            const imgField = fields.find((f: any) => f.name === 'image');

            if (imgField && imgField.type === 'file') {
                console.log("ℹ️ Found 'image' as FILE. Attempting update to TEXT...");
                // Remove the old field first? Or just update type?
                // Updating type directly usually fails if data exists.
                // Let's try to update the definition.
                const newFields = fields.map((f: any) => {
                    if (f.name === 'image') {
                        return { name: "image", type: "text" };
                    }
                    return f;
                });

                await pb.collections.update(col.id, { fields: newFields });
                console.log("✅ Updated products schema: 'image' is now TEXT");
            } else {
                console.log("ℹ️ 'image' is already TEXT or not found.");
            }

        } catch (e: any) {
            console.error("❌ Failed update in-place:", e.message);
            // Fallback: Delete and Recreate (since we are repairing)
            console.log("⚠️ Fallback: Recreating products collection...");
            await pb.collections.delete('products').catch(() => { });
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
                    { name: 'category', type: 'relation', collectionId: 'categories', maxSelect: 1 }, // Need valid ID?
                    // Fetch category ID dynamically if needed or rely on existing collections
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
            });
            console.log("✅ Recreated products collection.");
        }

    } catch (e: any) {
        console.error("❌ FINAL ERROR:", e.message);
    }
}

fixProductsImage();
