
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkMedia() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        const col = await pb.collections.getOne('media');
        console.log("Collection: media");
        console.log("Fields:", JSON.stringify((col as any).fields, null, 2));
    } catch (e: any) {
        console.error("❌ Media collection error:", e.message);
        // If media doesn't exist, we must create it
        if (e.status === 404) {
            console.log("ℹ️ Media collection does NOT exist. Creating...");
            try {
                await pb.collections.create({
                    name: 'media',
                    type: 'base',
                    schema: [
                        { name: 'file', type: 'file', maxSelect: 1, maxSize: 5242880, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
                        { name: 'alt', type: 'text' }
                    ],
                    listRule: "",
                    viewRule: "",
                    createRule: "",
                    updateRule: "@request.auth.id != ''",
                    deleteRule: "@request.auth.id != ''",
                });
                console.log("✅ Created media collection.");
            } catch (err: any) {
                console.error("❌ Failed to create media:", err.message);
            }
        }
    }
}
checkMedia();
