
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixCouponsSchema() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email!, password!);

        const col = await pb.collections.getOne('coupons');
        let fields = (col as any).fields;

        // Remove legacy 'value' field if present (conflicts with discount_value)
        fields = fields.filter((f: any) => f.name !== 'value');

        // Ensure partner_name exists
        if (!fields.find((f: any) => f.name === 'partner_name')) {
            console.log("➕ Adding 'partner_name' field...");
            fields.push({ name: 'partner_name', type: 'text' });
        }

        // Ensure discount_type is select or text? 
        // Action sends 'percent' or 'fixed'. 
        // Let's check if it exists.
        if (!fields.find((f: any) => f.name === 'discount_type')) {
            console.log("➕ Adding 'discount_type' field...");
            fields.push({
                name: 'discount_type',
                type: 'text', // Simplification
            });
        }

        if (!fields.find((f: any) => f.name === 'code')) {
            console.log("➕ Adding 'code' field...");
            fields.push({ name: 'code', type: 'text', required: true });
        }

        if (!fields.find((f: any) => f.name === 'discount_value')) {
            console.log("➕ Adding 'discount_value' field...");
            fields.push({ name: 'discount_value', type: 'number', required: true });
        }

        await pb.collections.update(col.id, { fields });
        console.log("✅ Updated coupons schema.");

    } catch (e: any) {
        console.error("❌ Error:", e.message);
        console.error("Data:", JSON.stringify(e.data, null, 2));
    }
}

fixCouponsSchema();
