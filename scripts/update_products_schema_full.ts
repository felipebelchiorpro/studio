
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixProductsSchemaMany() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);

        try {
            const col = await pb.collections.getOne('products');
            let fields = (col as any).fields;

            // 1. Change 'gallery' to json (was file)
            // If it exists as file, we replace it.
            // 2. Add 'hover_image_url' (text)
            // 3. Add 'sizes', 'flavors', 'weights', 'color_mapping', 'flavor_mapping' (json)

            const missingFields = [
                { name: 'hover_image_url', type: 'text' },
                { name: 'sizes', type: 'json' },
                { name: 'flavors', type: 'json' },
                { name: 'weights', type: 'json' },
                { name: 'color_mapping', type: 'json' },
                { name: 'flavor_mapping', type: 'json' }
            ];

            // Filter out fields we want to replace or ensure
            fields = fields.filter((f: any) => f.name !== 'gallery');

            // Add gallery as json
            fields.push({ name: 'gallery', type: 'json' });

            // Add missing ones if not present
            missingFields.forEach(mf => {
                if (!fields.find((f: any) => f.name === mf.name)) {
                    fields.push(mf);
                }
            });

            // Update collection
            await pb.collections.update(col.id, {
                fields: fields,
                // OPEN UP RULES temporarily to verify frontend creation
                createRule: "",
                updateRule: "",
                deleteRule: ""
            });
            console.log("✅ Updated products schema with ALL fields and Rules.");

        } catch (e: any) {
            console.error("❌ Failed update:", e.message);
        }

    } catch (e: any) {
        console.error("❌ Auth/Setup Error:", e.message);
    }
}

fixProductsSchemaMany();
