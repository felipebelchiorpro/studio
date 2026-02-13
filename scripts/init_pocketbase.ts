
import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local if not already loaded
// In a script context, we might need dotenv if not running via a runner that preloads it.
// Assuming the user runs this with `npx tsx` which might not load .env.local automatically by default differently than Next.js.
// We'll trust the user to have the vars or load them.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.darkstoresuplementos.com/';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

async function main() {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('❌ Error: POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD must be set in .env.local');
        process.exit(1);
    }

    console.log(`🔌 Connecting to PocketBase at ${PB_URL}...`);
    const pb = new PocketBase(PB_URL);

    try {
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ Admin authenticated successfully.');
    } catch (error: any) {
        console.error('❌ Failed to authenticate as admin:', error.message);
        process.exit(1);
    }

    const schemaPath = path.join(process.cwd(), 'pocketbase_schema.json');
    if (!fs.existsSync(schemaPath)) {
        console.error('❌ pocketbase_schema.json not found.');
        process.exit(1);
    }

    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    console.log(`📂 Found ${schema.length} collections in schema.`);

    for (const collection of schema) {
        try {
            console.log(`Checking collection: ${collection.name}...`);
            try {
                const existing = await pb.collections.getOne(collection.name);
                console.log(`   - Collection ${collection.name} exists. Updating...`);
                // Merging schema can be tricky, but let's try to update basic rules and fields
                // Note: Deleting fields is destructive, so PB might block "destructive" updates via this method unless using specific flags or manual care
                // We will try to update the schema definition.
                await pb.collections.update(existing.id, collection);
                console.log(`   ✅ Detail: ${collection.name} updated.`);
            } catch (err: any) {
                if (err.status === 404) {
                    console.log(`   - Collection ${collection.name} does not exist. Creating...`);
                    await pb.collections.create(collection);
                    console.log(`   ✅ Created ${collection.name}.`);
                } else {
                    throw err;
                }
            }
        } catch (error: any) {
            console.error(`❌ Error processing collection ${collection.name}:`, error.message);
            // Don't exit, try next
        }
    }

    console.log('✨ Migration completed.');
}

main();
