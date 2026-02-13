
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testFetch() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        console.time("Fetch Categories");
        const records = await pb.collection('categories').getFullList({
            sort: 'name',
        });
        console.timeEnd("Fetch Categories");
        console.log(`Fetched ${records.length} categories.`);

        if (records.length > 0) {
            console.log("Sample:", JSON.stringify(records[0], null, 2));
        }

    } catch (e: any) {
        console.error(e);
    }
}
testFetch();
