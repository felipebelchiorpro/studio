
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixPromotionsSchema() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);

        const col = await pb.collections.getOne('promotions');
        let fields = (col as any).fields;

        // 1. Ensure new fields for Banners exist
        const newFields = [
            { name: 'image_url', type: 'text' },
            { name: 'mobile_image_url', type: 'text' },
            { name: 'link', type: 'text' },
            { name: 'position', type: 'text' }
        ];

        newFields.forEach(nf => {
            if (!fields.find((f: any) => f.name === nf.name)) {
                console.log(`➕ Adding '${nf.name}' field...`);
                fields.push(nf);
            }
        });

        // 2. Update Collection with new fields AND Public Rules
        await pb.collections.update(col.id, {
            fields: fields,
            listRule: "", // Public
            viewRule: ""  // Public
        });

        console.log("✅ Updated 'promotions' schema and rules.");

    } catch (e: any) {
        console.error("❌ Error:", e.message);
    }
}

fixPromotionsSchema();
