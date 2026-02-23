import { getPocketBaseAdmin } from '../src/lib/pocketbaseAdmin';

async function checkOrdersCollectionRules() {
    try {
        const pbAdmin = await getPocketBaseAdmin();
        const collection = await pbAdmin.collections.getOne('orders');
        console.log("Orders Collection Rules:");
        console.log("------------------------");
        console.log("List Rule:", collection.listRule);
        console.log("View Rule:", collection.viewRule);
        console.log("Create Rule:", collection.createRule);
        console.log("Update Rule:", collection.updateRule);
        console.log("Delete Rule:", collection.deleteRule);
    } catch (e) {
        console.error("Failed to check rules:", e);
    }
}

checkOrdersCollectionRules();
