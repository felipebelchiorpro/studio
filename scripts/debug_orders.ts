
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.darkstoresuplementos.com/';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

async function main() {
    const pb = new PocketBase(PB_URL);
    await pb.admins.authWithPassword(ADMIN_EMAIL!, ADMIN_PASSWORD!);

    const ordersSchema = {
        "name": "orders",
        "type": "base",
        "schema": [
            {
                "name": "user",
                "type": "relation",
                "options": {
                    "collectionId": "_pb_users_auth_",
                    "cascadeDelete": false,
                    "maxSelect": 1
                }
            },
            {
                "name": "items",
                "type": "json"
            },
            {
                "name": "total",
                "type": "number"
            },
            {
                "name": "status",
                "type": "select",
                "options": {
                    "values": ["pending", "paid", "packing", "sent", "delivered", "cancelled"]
                }
            },
            {
                "name": "payment_method",
                "type": "text"
            },
            {
                "name": "payment_id",
                "type": "text"
            },
            {
                "name": "shipping_address",
                "type": "json"
            },
            {
                "name": "shipping_cost",
                "type": "number"
            }
        ],
        "listRule": null,
        "viewRule": null,
        "createRule": null
    };

    try {
        console.log("Attempting to create orders collection...");
        await pb.collections.create(ordersSchema);
        console.log("✅ Orders collection created successfully!");
    } catch (err: any) {
        console.error("❌ Failed to create orders collection:");
        console.error("Status:", err.status);
        console.error("Message:", err.message);
        console.error("Data:", JSON.stringify(err.data, null, 2));
    }
}

main();
