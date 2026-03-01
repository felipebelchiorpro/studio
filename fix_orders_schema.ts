import { getPocketBaseAdmin } from './src/lib/pocketbaseAdmin';

async function run() {
    try {
        const pbAdmin = await getPocketBaseAdmin();
        const collection = await pbAdmin.collections.getOne('orders');

        const originalLength = collection.fields.length;
        collection.fields = collection.fields.filter(f => f.name !== 'created' && f.name !== 'updated');

        if (collection.fields.length < originalLength) {
            await pbAdmin.collections.update('orders', collection);
            console.log("Removed custom created/updated fields.");
        }

    } catch (e) {
        console.error(e);
    }
}
run();
