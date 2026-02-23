import PocketBase from 'pocketbase';

async function main() {
    console.log("Starting debug script...");
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');

    const email = process.env.POCKETBASE_ADMIN_EMAIL || 'contatofelipebelchior@gmail.com';
    const password = process.env.POCKETBASE_ADMIN_PASSWORD || '12345678';

    try {
        console.log("Authenticating as admin...");
        await pb.admins.authWithPassword(email, password);
        console.log("Authenticated successfully.");

        console.log("Fetching orders from collection...");
        const records = await pb.collection('orders').getFullList({
            sort: '-created',
        });

        console.log("Total orders found:", records.length);
        if (records.length > 0) {
            console.log("\nFirst 3 orders raw data:");
            records.slice(0, 3).forEach((r, i) => {
                console.log(`\n--- Order ${i + 1} [ID: ${r.id}] ---`);
                console.log("Status:", r.status);
                console.log("Total:", r.total);
                console.log("Items (type):", typeof r.items);
                console.log("Items (raw snippet):", JSON.stringify(r.items).substring(0, 100) + "...");
            });
        }
    } catch (e: any) {
        console.error("Error during execution:", e.message);
        if (e.response) {
            console.error("Response:", JSON.stringify(e.response, null, 2));
        }
    }
}

main();
