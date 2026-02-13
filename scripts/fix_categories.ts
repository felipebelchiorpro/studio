
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixCategories() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("Missing Admin Credentials");
        return;
    }

    try {
        await pb.admins.authWithPassword(email, password);
        console.log("✅ Admin Login Successful");

        // 1. Delete all existing records (ghosts)
        console.log("Fetching existing records to delete...");

        // Use default getFullList logic which seemed to work for fetching IDs
        let records = [];
        try {
            records = await pb.collection('categories').getFullList();
            console.log(`Found ${records.length} records to delete.`);
        } catch (e) {
            console.log("Could not fetch records, might be empty or broken.", e);
        }

        for (const r of records) {
            try {
                await pb.collection('categories').delete(r.id);
                console.log(`Deleted record: ${r.id}`);
            } catch (e: any) {
                console.error(`Failed to delete ${r.id}:`, e.message);
            }
        }

        // 2. Recreate Collection
        console.log("Recreating 'categories' collection...");
        try {
            await pb.collections.delete('categories');
            console.log("Deleted old 'categories' collection.");
        } catch (e) {
            console.log("Collection might not exist, proceeding...");
        }

        const newFields = [
            {
                "name": "name",
                "type": "text",
                "required": true,
                "presentable": true,
                "unique": false
            },
            {
                "name": "slug",
                "type": "text",
                "required": true,
                "presentable": false,
                "unique": true
            },
            {
                "name": "image",
                "type": "file",
                "required": false,
                "presentable": true,
                "unique": false,
                "options": {
                    "maxSelect": 1,
                    "maxSize": 5242880,
                    "mimeTypes": ["image/jpeg", "image/png", "image/svg+xml", "image/webp"]
                }
            },
            {
                "name": "parent_id",
                "type": "text",
                "required": false
            },
            {
                "name": "parent_id",
                "type": "text",
                "required": false
            }
            // {
            //     "name": "type",
            //     "type": "select",
            //     "required": false,
            //     "options": {
            //         "maxSelect": 1,
            //         "values": [
            //             "supplement",
            //             "clothing",
            //             "other"
            //         ]
            //     }
            // }
        ];

        await pb.collections.create({
            name: 'categories',
            type: 'base',
            fields: newFields,
            listRule: "", // Public
            viewRule: "", // Public
            createRule: null, // Admin only
            updateRule: null,
            deleteRule: null,
        });

        console.log("✅ Categories Collection Recreated Successfully!");

    } catch (error: any) {
        console.error("❌ Script Failed:", error.message);
        if (error.data) console.error(JSON.stringify(error.data, null, 2));
    }
}

fixCategories();
