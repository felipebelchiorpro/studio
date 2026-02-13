import PocketBase from 'pocketbase';

export async function getPocketBaseAdmin() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.darkstoresuplementos.com/');

    // Admin Auth
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error("POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD not set");
    }

    try {
        await pb.admins.authWithPassword(email, password);
    } catch (error) {
        console.error("Failed to authenticate as admin:", error);
        throw error;
    }

    return pb;
}
