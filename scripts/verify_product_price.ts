
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyProductPrice() {
    console.log("🔍 Verifying product price persistence...");

    const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.darkstoresuplementos.com/';
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("❌ Missing env vars");
        return;
    }

    try {
        const pb = new PocketBase(url);
        await pb.admins.authWithPassword(email, password);
        console.log("✅ Authenticated as Admin");

        // 0. Get dependencies
        const category = await pb.collection('categories').getFirstListItem('');
        const brand = await pb.collection('brands').getFirstListItem('');
        console.log(`Using Category: ${category.id}, Brand: ${brand.id}`);

        // 1. Create a transient test product
        console.log("Creating test product...");
        const product = await pb.collection('products').create({
            name: "Test Price Product " + Date.now(),
            slug: "test-price-" + Date.now(),
            price: 100,
            original_price: 120, // This should now save
            active: true,
            category: category.id,
            brand: brand.id,
            image: "test.jpg", // Mock
            description: "Test Description"
        });
        console.log("✅ Product created with original_price: 120");

        // 2. Fetch it back
        const fetched = await pb.collection('products').getOne(product.id);
        console.log("fetched.original_price:", fetched.original_price);

        if (fetched.original_price === 120) {
            console.log("✅ SUCCESS: original_price persisted!");
        } else {
            console.error("❌ FAILURE: original_price did not persist. Got:", fetched.original_price);
        }

        // 3. Cleanup
        await pb.collection('products').delete(product.id);
        console.log("🧹 Cleanup done.");

    } catch (e: any) {
        console.error("❌ Error:", e.message);
        if (e.response) console.error("Response:", JSON.stringify(e.response, null, 2));
    }
}

verifyProductPrice();
