
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createAdmin() {
    // Get arguments from command line
    const args = process.argv.slice(2);
    const newEmail = args[0];
    const newPassword = args[1];

    if (!newEmail || !newPassword) {
        console.error("❌ Usage: npx tsx scripts/create_admin.ts <email> <password>");
        process.exit(1);
    }

    if (newPassword.length < 8) {
        console.error("❌ Password must be at least 8 characters long.");
        process.exit(1);
    }

    console.log(`🚀 Attempting to create new Admin: ${newEmail}`);

    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    const rootEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const rootPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!rootEmail || !rootPassword) {
        console.error("❌ Root admin credentials not found in .env.local");
        process.exit(1);
    }

    try {
        // Authenticate as Root Admin
        await pb.admins.authWithPassword(rootEmail, rootPassword);
        console.log("✅ Authenticated as Root Admin.");

        // Create New Admin
        await pb.admins.create({
            email: newEmail,
            password: newPassword,
            passwordConfirm: newPassword,
        });

        console.log(`\n🎉 SUCCESS! New Superadmin created.`);
        console.log(`📧 Email: ${newEmail}`);
        console.log(`🔑 Password: ${newPassword}`);
        console.log(`\n👉 They can now login at /login to access the Dashboard.`);

    } catch (error: any) {
        console.error("\n❌ Failed to create admin:", error?.response?.data || error.message);
    }
}

createAdmin();
