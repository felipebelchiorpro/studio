
import PocketBase from 'pocketbase';

async function getPocketBaseAdmin() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.darkstoresuplementos.com/');

    // Admin Auth - Hardcoded for test
    const email = 'contatofelipebelchior@gmail.com';
    const password = '12345678';

    if (!email || !password) {
        throw new Error("POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD not set");
    }

    try {
        await pb.admins.authWithPassword(email, password);
    } catch (error) {
        console.error("Failed to authenticate as admin:", error);
        throw error;
    }

    return pb;
}

async function testCreateOrder() {
    try {
        console.log("Testing getPocketBaseAdmin...");
        const pbAdmin = await getPocketBaseAdmin();
        console.log("Admin authenticated:", pbAdmin.authStore.isValid, pbAdmin.authStore.isAdmin);

        console.log("Attempting to create a test order...");
        const payload = {
            user: "", // Guest
            total: 100,
            shipping_cost: 10,
            status: 'pending',
            payment_id: 'test_payment_id_' + Date.now(),
            payment_method: 'credit_card',
            shipping_address: { street: "Test Street", number: "123" },
            items: [{ id: "test-item", name: "Test Product", price: 100, quantity: 1 }]
        };

        const record = await pbAdmin.collection('orders').create(payload);
        console.log("Order created successfully:", record.id);

    } catch (error: any) {
        console.error("Test failed:", error);
        console.error("Error details:", error.response?.data);
    }
}

testCreateOrder();
