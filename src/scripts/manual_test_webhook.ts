
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    console.log("--- Manual Webhook Test Script ---");

    try {
        // We need to dynamic import to ensure env vars are loaded first if the module uses them at top level
        const { testWebhook } = await import('@/actions/settings');

        console.log("Calling testWebhook()...");
        const result = await testWebhook();

        console.log("Result:", result);
    } catch (error) {
        console.error("Script Error:", error);
    }
}

run();
