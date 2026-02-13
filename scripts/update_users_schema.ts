
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateUsersSchema() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);

        const col = await pb.collections.getOne('users');
        let fields = (col as any).fields;

        if (!fields.find((f: any) => f.name === 'phone')) {
            console.log("➕ Adding 'phone' field...");
            fields.push({ name: 'phone', type: 'text' });
        }

        // Just in case, ensure name is there (it was in the list, but let's be safe)
        if (!fields.find((f: any) => f.name === 'name')) {
            console.log("➕ Adding 'name' field...");
            fields.push({ name: 'name', type: 'text' });
        }

        await pb.collections.update(col.id, { fields });
        console.log("✅ Updated 'users' schema.");

    } catch (e: any) {
        console.error("❌ Error:", e.message);
    }
}

updateUsersSchema();
