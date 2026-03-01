import { getPocketBaseAdmin } from './src/lib/pocketbaseAdmin';

async function run() {
    try {
        const pbAdmin = await getPocketBaseAdmin();
        const collection = await pbAdmin.collections.getOne('integration_settings');

        let updated = false;

        const fieldsToAdd = [
            { name: "chatwoot_url", type: "url", required: false, hidden: false, system: false },
            { name: "chatwoot_account_id", type: "text", required: false, hidden: false, system: false },
            { name: "chatwoot_token", type: "text", required: false, hidden: false, system: false },
            { name: "chatwoot_inbox_id", type: "text", required: false, hidden: false, system: false },
        ];

        for (const field of fieldsToAdd) {
            if (!collection.fields.find((f: any) => f.name === field.name)) {
                collection.fields.push(field);
                updated = true;
                console.log(`Added field: ${field.name}`);
            }
        }

        if (updated) {
            await pbAdmin.collections.update('integration_settings', collection);
            console.log("Updated integration_settings collection with Chatwoot fields!");
        } else {
            console.log("Chatwoot fields already present in integration_settings.");
        }

    } catch (e) {
        console.error(e);
    }
}
run();
