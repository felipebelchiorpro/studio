
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixIntegrationSchema() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);

        const col = await pb.collections.getOne('integration_settings');
        let fields = (col as any).fields;

        const newFields = [
            { name: 'mp_access_token', type: 'text' },
            { name: 'mp_public_key', type: 'text' }
        ];

        let changed = false;
        newFields.forEach(nf => {
            if (!fields.find((f: any) => f.name === nf.name)) {
                console.log(`➕ Adding '${nf.name}' field...`);
                fields.push(nf);
                changed = true;
            }
        });

        if (changed) {
            await pb.collections.update(col.id, {
                fields: fields
            });
            console.log("✅ Updated 'integration_settings' schema.");
        } else {
            console.log("👌 Schema already up to date.");
        }

    } catch (e: any) {
        console.error("❌ Error:", e.message);
    }
}

fixIntegrationSchema();
