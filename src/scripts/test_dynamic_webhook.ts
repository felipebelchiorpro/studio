
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    console.log("--- Manual Dynamic Webhook Test ---");

    try {
        // Mock Supabase calls manually or just import the service
        // Since the service depends on DB state which might not match our mock IDs,
        // we might fail on category lookup if we use real IDs.
        // But let's try calling triggerOrderCreatedWebhook with a mock order.

        const { triggerOrderCreatedWebhook } = await import('@/services/webhookTriggerService');

        const mockOrder: any = {
            id: 'mock-order-123',
            userId: 'guest',
            items: [
                { id: 'prod1', name: 'Whey Protein', quantity: 1, price: 100, categoryId: 'cat-1' }, // Supplement
                { id: 'prod2', name: 'T-Shirt', quantity: 1, price: 50, categoryId: 'cat-2' }      // Clothing
            ],
            totalAmount: 150,
            userPhone: '5511999999999',
            shippingAddress: { city: 'São Paulo', type: 'delivery' }
        };

        // We need 'cat-1' and 'cat-2' to exist in DB for the logic to work perfectly?
        // Actually, the logic queries DB. If IDs don't exist, it defaults.
        // Let's rely on default behavior or basic successful run.

        console.log("Triggering Webhook...");
        await triggerOrderCreatedWebhook(mockOrder);

        console.log("Done.");
    } catch (error) {
        console.error("Script Error:", error);
    }
}

run();
