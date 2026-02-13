
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugRelation() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // Try 1: Standard options
        console.log("Attempt 1: Standard options { collectionId: 'categories' }");
        try {
            await pb.collections.create({
                name: 'test_relation_1',
                type: 'base',
                fields: [
                    {
                        name: 'cat_rel',
                        type: 'relation',
                        required: false,
                        options: {
                            collectionId: 'categories',
                            maxSelect: 1
                        }
                    }
                ]
            });
            console.log("✅ Attempt 1 Success!");
            await pb.collections.delete('test_relation_1');
        } catch (e: any) {
            console.log("❌ Attempt 1 Failed:", JSON.stringify(e.data || e.message, null, 2));
        }

        // Try 2: ID instead of name
        const cat = await pb.collections.getOne('categories');
        console.log(`Attempt 2: ID options { collectionId: '${cat.id}' }`);
        try {
            await pb.collections.create({
                name: 'test_relation_2',
                type: 'base',
                fields: [
                    {
                        name: 'cat_rel',
                        type: 'relation',
                        required: false,
                        options: {
                            collectionId: cat.id,
                            maxSelect: 1
                        }
                    }
                ]
            });
            console.log("✅ Attempt 2 Success!");
            await pb.collections.delete('test_relation_2');
        } catch (e: any) {
            console.log("❌ Attempt 2 Failed:", JSON.stringify(e.data || e.message, null, 2));
        }

        // Try 3: collectionId at root (weird but checking)
        console.log("Attempt 3: Root collectionId");
        try {
            await pb.collections.create({
                name: 'test_relation_3',
                type: 'base',
                fields: [
                    {
                        name: 'cat_rel',
                        type: 'relation',
                        required: false,
                        collectionId: cat.id,
                        options: {
                            maxSelect: 1
                        }
                    } as any
                ]
            });
            console.log("✅ Attempt 3 Success!");
            await pb.collections.delete('test_relation_3');
        } catch (e: any) {
            console.log("❌ Attempt 3 Failed:", JSON.stringify(e.data || e.message, null, 2));
        }

    } catch (e) {
        console.error(e);
    }
}

debugRelation();
