'use server';

import { pb } from "@/lib/pocketbase";

export async function updateUserAddressAction(userId: string, address: any) {
    try {
        await pb.collection('users').update(userId, {
            address: address
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user address:", error);
        return { success: false, message: error.message };
    }
}
