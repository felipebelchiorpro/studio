
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testCreateProduct() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // 1. Get Category
        const cat = await pb.collection('categories').getFirstListItem('');
        console.log(`✅ Category: ${cat.name} (${cat.id})`);

        // 2. Get Brand
        const brand = await pb.collection('brands').getFirstListItem('');
        console.log(`✅ Brand: ${brand.name} (${brand.id})`);

        // 3. Create Product
        const payload = {
            name: "Test Product Auto",
            slug: `test-prod-${Date.now()}`,
            description: "Automated test product",
            price: 99.90,
            category: cat.id,
            brand: brand.id,
            active: true,
            stock: 10
        };

        const prod = await pb.collection('products').create(payload);
        console.log(`✅ Product Created: ${prod.name} (${prod.id})`);

        // Cleanup
        await pb.collection('products').delete(prod.id);
        console.log("✅ Cleanup (Deleted test product)");

    } catch (e: any) {
        console.error("❌ Failed:", e.message);
        if (e.data) console.error(JSON.stringify(e.data, null, 2));
    }
}

testCreateProduct();
