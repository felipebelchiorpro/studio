import { getPocketBaseAdmin } from './src/lib/pocketbaseAdmin';

async function run() {
    try {
        const pbAdmin = await getPocketBaseAdmin();
        const collection = await pbAdmin.collections.getOne('coupons');

        let updated = false;

        const hasCreated = collection.fields.find(f => f.name === 'created');
        if (!hasCreated) {
            collection.fields.push({
                name: "created",
                type: "autodate",
                system: true,
                hidden: false,
                onCreate: true,
                onUpdate: false
            });
            updated = true;
        } else if (hasCreated.hidden) {
            hasCreated.hidden = false;
            updated = true;
        }

        const hasUpdated = collection.fields.find(f => f.name === 'updated');
        if (!hasUpdated) {
            collection.fields.push({
                name: "updated",
                type: "autodate",
                system: true,
                hidden: false,
                onCreate: true,
                onUpdate: true
            });
            updated = true;
        } else if (hasUpdated.hidden) {
            hasUpdated.hidden = false;
            updated = true;
        }

        if (updated) {
            await pbAdmin.collections.update('coupons', collection);
            console.log("Un-hidden system fields for coupons!");
        } else {
            console.log("Fields already visible or present for coupons.");
        }

    } catch (e) {
        console.error(e);
    }
}
run();
