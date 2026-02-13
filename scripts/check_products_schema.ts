
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkProductsSchema() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        const col = await pb.collections.getOne('products');

        console.log("Collection:", col.name);
        console.log("Rules:");
        console.log("- createRule:", col.createRule);
        console.log("- updateRule:", col.updateRule);
        console.log("- deleteRule:", col.deleteRule);
        console.log("Fields:", JSON.stringify((col as any).fields, null, 2));

    } catch (e: any) {
        console.error("❌ Error:", e.message);
    }
}

checkProductsSchema();
