
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixMedia() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        // Try to update existing or reconstruct
        const col = await pb.collections.getOne('media');
        const fields = (col as any).fields;

        let changed = false;
        if (!fields.find((f: any) => f.name === 'file')) {
            fields.push({
                name: "file",
                type: "file",
                maxSelect: 1,
                maxSize: 5242880,
                mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                thumbs: [],
                protected: false
            });
            changed = true;
        }
        if (!fields.find((f: any) => f.name === 'alt')) {
            fields.push({ name: "alt", type: "text" });
            changed = true;
        }

        if (changed) {
            await pb.collections.update(col.id, { fields });
            console.log("✅ Updated media collection: Added 'file' and 'alt'");
        } else {
            console.log("ℹ️ Media collection already has fields.");
        }

    } catch (e: any) {
        console.error("❌ Failed:", e.message);
    }
}

fixMedia();
