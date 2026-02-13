
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkMediaSchema() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);

        try {
            const col = await pb.collections.getOne('media');
            console.log("Collection:", col.name);
            console.log("Rules:");
            console.log("- createRule:", col.createRule);
            console.log("- listRule:", col.listRule);
            console.log("- viewRule:", col.viewRule);
            console.log("Fields:", JSON.stringify((col as any).fields, null, 2));
        } catch (e: any) {
            console.log("❌ Collection 'media' not found or error:", e.message);
        }

    } catch (e: any) {
        console.error("❌ Auth Error:", e.message);
    }
}

checkMediaSchema();
