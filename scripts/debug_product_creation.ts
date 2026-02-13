
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugCreateProduct() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // 1. Get a valid Category
        const cat = await pb.collection('categories').getFirstListItem('');
        console.log(`Using Category: ${cat.name} (${cat.id})`);

        // 2. Get a valid Brand
        const brand = await pb.collection('brands').getFirstListItem('');
        console.log(`Using Brand: ${brand.name} (${brand.id})`);

        // 3. Simulate Payload
        const payload = {
            name: "Produto Teste Debug " + Date.now(),
            slug: "produto-teste-debug-" + Date.now(), // Added slug
            description: "Descrição teste",
            price: 150.50,
            original_price: 199.90, // Note: Service maps 'originalPrice' to 'original_price'. Payload to DB must use DB keys.
            // Wait, does the Service do the mapping?
            // Yes, createProductService gets Partial<Product> and maps to keys.
            // key: "category", value: cat.id
            category: cat.id,
            brand: brand.id,
            stock: 10,
            image: "https://placehold.co/600x400", // New text field
            gallery: ["https://placehold.co/600x400", "https://placehold.co/600x400"],
            featured: true,
            active: true
        };

        console.log("Sending Payload:", JSON.stringify(payload, null, 2));

        try {
            const record = await pb.collection('products').create(payload);
            console.log(`✅ Success! Created ${record.id}`);
            // Cleanup
            await pb.collection('products').delete(record.id);
        } catch (err: any) {
            console.error("❌ FAILURE RESPONSE:");
            console.error("Status:", err.status);
            console.error("Message:", err.message);
            console.error("Data:", JSON.stringify(err.data, null, 2));
        }

    } catch (e: any) {
        console.error("❌ Setup Error:", e.message);
    }
}

debugCreateProduct();
