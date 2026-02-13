
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateAdminPassword() {
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const oldPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
    const newPassword = '12345678';

    console.log(`Attempting to update password for: ${email}`);

    try {
        // Authenticate first
        const authData = await pb.admins.authWithPassword(email!, oldPassword!);
        console.log("✅ Admin Login Successful!");

        // Update password
        // Admin ID is needed. From authData.admin.id (or authData.record.id if v0.23+)
        const adminId = authData.admin?.id || authData.record?.id;

        if (!adminId) {
            throw new Error("Could not find Admin ID in auth response.");
        }

        await pb.admins.update(adminId, {
            password: newPassword,
            passwordConfirm: newPassword,
        });

        console.log("✅ Admin Password Updated Successfully to '123456'");

    } catch (error: any) {
        console.error("❌ Failed to update password:", error.message);
        if (error.data) {
            console.error("Validation Errors:", JSON.stringify(error.data, null, 2));
        }
        console.error("Original Error:", error);
    }
}

updateAdminPassword();
