
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addTypeField() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login Successful");

        const collection = await pb.collections.getOne('categories');
        const fields = (collection as any).fields || [];

        // Debug: Check 'orders' collection for reference
        try {
            const ordersCol = await pb.collections.getOne('orders');
            const statusField = (ordersCol as any).fields?.find((f: any) => f.type === 'select');
            if (statusField) {
                console.log("Reference Select Field (orders.status):", JSON.stringify(statusField, null, 2));
            }
        } catch (e) {
            console.log("Could not fetch orders collection for reference.");
        }

        console.log("Current fields:", fields.map((f: any) => f.name));

        // Remove test field if exists
        const testIndex = fields.findIndex((f: any) => f.name === 'category_type_test');
        if (testIndex !== -1) fields.splice(testIndex, 1);

        const typeField = {
            "name": "type",
            "type": "text", // Fallback to text to bypass select validation issues
            "required": false,
            "presentable": false,
            "unique": false,
            "options": {}
        };

        // Check if exists
        const exists = fields.find((f: any) => f.name === 'type');
        if (!exists) {
            fields.push(typeField);
        } else {
            console.log("Type field already exists, updating...");
            // Force update to text if it was broken select
            const index = fields.indexOf(exists);
            fields[index] = typeField;
        }

        await pb.collections.update(collection.id, {
            fields: fields
        });

        console.log("✅ 'type' field added successfully via Update!");

    } catch (error: any) {
        console.error("❌ Failed to add type field:", error.message);
        if (error.data) console.error(JSON.stringify(error.data, null, 2));
    }
}

addTypeField();
