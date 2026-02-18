
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugFeatured() {
    console.log("🔍 Debugging 'featured' (New Releases) products...");

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

        // 1. Check schema for 'featured' field
        const collection = await pb.collections.getOne('products');
        // PB 0.23+ uses fields, older uses schema
        const fields = collection.fields || collection.schema;
        const featuredField = fields.find((f: any) => f.name === 'featured');

        if (!featuredField) {
            console.error("❌ 'featured' field NOT FOUND in 'products' schema!");
        } else {
            console.log("✅ 'featured' field exists:", JSON.stringify(featuredField, null, 2));
        }

        // 2. Count products with featured = true
        const records = await pb.collection('products').getList(1, 10, {
            filter: 'featured = true',
            fields: 'id,name,featured'
        });

        console.log(`\n📊 Found ${records.totalItems} products with featured=true:`);
        records.items.forEach(p => console.log(` - [${p.id}] ${p.name} (featured: ${p.featured})`));

        // 3. Check a sample product that SHOULD be featured (if any active)
        const recent = await pb.collection('products').getList(1, 3, { sort: '-created' });
        console.log("\nRecent Products Check:");
        recent.items.forEach(p => console.log(` - [${p.id}] ${p.name} (featured: ${p.featured})`));

    } catch (e: any) {
        console.error("❌ Error:", e.message);
        if (e.response) console.error("Response:", JSON.stringify(e.response, null, 2));
    }
}

debugFeatured();
