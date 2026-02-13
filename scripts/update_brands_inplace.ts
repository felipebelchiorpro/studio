
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateBrandsInPlace() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);
        console.log("✅ Admin Login");

        const col = await pb.collections.getOne('brands');
        const fields = (col as any).fields;

        // Find logo field
        const logoIdx = fields.findIndex((f: any) => f.name === 'logo');
        if (logoIdx >= 0) {
            console.log("ℹ️ Found existing 'logo' field of type:", fields[logoIdx].type);
            // Change to text
            fields[logoIdx] = {
                name: "logo",
                type: "text",
                required: false
            };
        } else {
            console.log("ℹ️ 'logo' field not found, adding it...");
            fields.push({
                name: "logo",
                type: "text",
                required: false
            });
        }

        try {
            await pb.collections.update(col.id, { fields });
            console.log("✅ Updated brands schema: 'logo' is now TEXT");
        } catch (err: any) {
            console.error("❌ Failed to update schema:", err.message);
            console.error("If it fails due to type change, we might need to delete the field first.");
        }

    } catch (e: any) {
        console.error("❌ FINAL ERROR:", e.message);
    }
}

updateBrandsInPlace();
