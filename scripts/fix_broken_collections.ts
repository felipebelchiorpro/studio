
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixCollections() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login Successful");

        // Helper to recreate a collection
        const recreateCollection = async (name: string, fields: any[]) => {
            console.log(`\n🔧 Fixing '${name}'...`);
            try {
                // Delete existing (assuming empty or broken)
                try {
                    await pb.collections.delete(name);
                    console.log(`   Deleted old '${name}'.`);
                } catch (e) {
                    // Ignore if doesn't exist
                }

                // Create new
                await pb.collections.create({
                    name: name,
                    type: 'base',
                    fields: fields,
                    listRule: "", // Public by default for catalog, restricted later if needed
                    viewRule: "",
                    createRule: null, // Admin only by default
                    updateRule: null,
                    deleteRule: null,
                });
                console.log(`   ✅ Created '${name}' successfully.`);
            } catch (err: any) {
                console.error(`   ❌ Failed to create '${name}':`, err.message);
                if (err.data) console.error(JSON.stringify(err.data, null, 2));
            }
        };

        // --- SCHEMAS ---

        // 1. brands
        await recreateCollection('brands', [
            { name: "name", type: "text", required: true },
            { name: "slug", type: "text", required: true, unique: true },
            { name: "logo", type: "file", options: { maxSelect: 1, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] } },
            { name: "active", type: "bool" }
        ]);

        // 2. products 
        // Note: Relation fields need the target collection ID. 
        // We fetch them here.
        let catCol;
        try {
            catCol = await pb.collections.getOne('categories');
        } catch (e) {
            console.error("❌ Failed to fetch categories collection:", e);
            return;
        }

        let brandCol;
        try {
            // We just created brands, but let's fetch it to be sure we have the ID
            brandCol = await pb.collections.getOne('brands');
        } catch (e) {
            console.error("❌ Failed to fetch brands collection:", e);
            return;
        }

        console.log(`Reference IDs - Category: ${catCol.id}, Brand: ${brandCol.id}`);

        if (!catCol.id || !brandCol.id) {
            console.error("❌ Missing Collection IDs for relation");
            return;
        }

        await recreateCollection('products', [
            { name: "name", type: "text", required: true },
            { name: "slug", type: "text", required: true, unique: true },
            { name: "description", type: "editor" },
            { name: "price", type: "number", required: true },
            { name: "old_price", type: "number" },
            { name: "cost_price", type: "number" },
            { name: "image", type: "file", options: { maxSelect: 1, mimeTypes: ["image/jpeg", "image/png", "image/webp"] } },
            { name: "gallery", type: "file", options: { maxSelect: 5, mimeTypes: ["image/jpeg", "image/png", "image/webp"] } },
            { name: "category", type: "relation", required: true, collectionId: catCol.id, options: { maxSelect: 1, cascadeDelete: false } },
            { name: "brand", type: "relation", collectionId: brandCol.id, options: { maxSelect: 1, cascadeDelete: false } },
            { name: "active", type: "bool" },
            { name: "featured", type: "bool" },
            { name: "has_variations", type: "bool" },
            { name: "stock", type: "number" },
            { name: "min_stock", type: "number" },
            { name: "sku", type: "text" },
            { name: "barcode", type: "text" },
            { name: "weight", type: "number" },
            { name: "height", type: "number" },
            { name: "width", type: "number" },
            { name: "length", type: "number" },
            { name: "variations", type: "json" }
        ]);

        // 3. shipping_rates
        await recreateCollection('shipping_rates', [
            { name: "city", type: "text", required: true },
            { name: "state", type: "text", required: true },
            { name: "price", type: "number", required: true },
            { name: "delivery_days", type: "number" },
            { name: "active", type: "bool" }
        ]);

        // 4. coupons
        await recreateCollection('coupons', [
            { name: "code", type: "text", required: true, unique: true },
            { name: "type", type: "text" }, // "percent" or "fixed" - Text to avoid Select issues
            { name: "value", type: "number", required: true },
            { name: "min_amount", type: "number" },
            { name: "usage_limit", type: "number" },
            { name: "usage_count", type: "number" },
            { name: "start_date", type: "date" },
            { name: "expiration_date", type: "date" },
            { name: "active", type: "bool" }
        ]);

        // 5. promotions
        await recreateCollection('promotions', [
            { name: "name", type: "text", required: true },
            { name: "description", type: "text" },
            { name: "image", type: "file", options: { maxSelect: 1 } },
            { name: "type", type: "text" }, // "percent" or "fixed"
            { name: "value", type: "number" },
            { name: "start_date", type: "date" },
            { name: "end_date", type: "date" },
            { name: "active", type: "bool" },
            // Relation to products needs product ID. We just created products.
            // We can fetch it again to be sure perfectly safe
        ]);
        // Update relations later or assume product ID is resolvable via name if handled by SDK? 
        // SDK requires ID. Let's fetch products col.
        const prodCol = await pb.collections.getOne('products');
        // Update promotions to add relation
        try {
            await pb.collections.update('promotions', {
                fields: [
                    ...((await pb.collections.getOne('promotions') as any).fields),
                    { name: "products", type: "relation", collectionId: prodCol.id, options: { maxSelect: null } }
                ]
            });
            console.log("   ✅ Updated promotions with product relation.");
        } catch (e: any) { console.log("   ⚠️ Failed to add products relation to promotions", e.message); }


        // 6. partners
        await recreateCollection('partners', [
            { name: "name", type: "text", required: true },
            { name: "image", type: "file", options: { maxSelect: 1 } },
            { name: "link", type: "url" },
            { name: "active", type: "bool" }
        ]);

        // 7. integration_settings
        await recreateCollection('integration_settings', [
            { name: "provider", type: "text", required: true },
            { name: "enabled", type: "bool" },
            { name: "config", type: "json" } // Secret keys, tokens etc
        ]);

        // 8. store_settings
        await recreateCollection('store_settings', [
            { name: "name", type: "text" },
            { name: "description", type: "text" },
            { name: "logo", type: "file", options: { maxSelect: 1 } },
            { name: "address", type: "text" },
            { name: "phone", type: "text" },
            { name: "email", type: "email" },
            { name: "colors", type: "json" }
        ]);

        // 9. orders
        const userCol = await pb.collections.getOne('users');
        await recreateCollection('orders', [
            { name: "user", type: "relation", collectionId: userCol.id, options: { maxSelect: 1 } },
            { name: "items", type: "json" },
            { name: "subtotal", type: "number" },
            { name: "shipping_cost", type: "number" },
            { name: "discount", type: "number" },
            { name: "total", type: "number" },
            { name: "status", type: "text" }, // pending, paid, etc - Text to avoid Select issues
            { name: "payment_method", type: "text" },
            { name: "payment_id", type: "text" },
            { name: "shipping_address", type: "json" },
            { name: "tracking_code", type: "text" },
            { name: "notes", type: "text" }
        ]);


    } catch (error: any) {
        console.error("❌ Script Failed:", error.message);
    }
}

fixCollections();
