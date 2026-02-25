import { getPocketBaseAdmin } from '../src/lib/pocketbaseAdmin';

async function main() {
    try {
        const pbAdmin = await getPocketBaseAdmin();
        const token = pbAdmin.authStore.token;
        const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

        console.log("Fetching Integration Settings...");
        const settingsRes = await fetch(`${baseUrl}/api/collections/integration_settings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const settingsCollection = await settingsRes.json();

        // Add fields
        const chatwootFields = [
            { name: 'chatwoot_url', type: 'url', required: false, options: { pattern: '' } },
            { name: 'chatwoot_account_id', type: 'text', required: false, options: { min: null, max: null, pattern: '' } },
            { name: 'chatwoot_token', type: 'text', required: false, options: { min: null, max: null, pattern: '' } },
            { name: 'chatwoot_inbox_id', type: 'text', required: false, options: { min: null, max: null, pattern: '' } }
        ];

        let schemaChanged = false;
        const schemaMap = new Map();
        settingsCollection.schema.forEach((f: any) => schemaMap.set(f.name, f));

        for (const field of chatwootFields) {
            if (!schemaMap.has(field.name)) {
                settingsCollection.schema.push(field);
                schemaChanged = true;
            }
        }

        if (schemaChanged) {
            console.log("Updating Integration Settings...");
            const updateRes = await fetch(`${baseUrl}/api/collections/integration_settings`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ schema: settingsCollection.schema })
            });

            if (!updateRes.ok) {
                console.error("Failed to update settings", await updateRes.text());
            } else {
                console.log("Chatwoot settings added!");
            }
        } else {
            console.log("Chatwoot settings already exist.");
        }


        console.log("Fetching Orders...");
        const ordersRes = await fetch(`${baseUrl}/api/collections/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const ordersCollection = await ordersRes.json();

        if (!ordersCollection.schema.find((f: any) => f.name === 'tracking_code')) {
            console.log("Updating Orders...");
            ordersCollection.schema.push({ name: 'tracking_code', type: 'text', required: false, options: { min: null, max: null, pattern: '' } });

            const updateRes = await fetch(`${baseUrl}/api/collections/orders`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ schema: ordersCollection.schema })
            });

            if (!updateRes.ok) {
                console.error("Failed to update orders", await updateRes.text());
            } else {
                console.log("Tracking code added!");
            }
        } else {
            console.log("Tracking code already exists.");
        }

    } catch (e: any) {
        console.error('Error in main script:', e.message);
    }
}

main();
