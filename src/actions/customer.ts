'use server';

import { getPocketBaseAdmin } from '@/lib/pocketbaseAdmin';
import { CustomerUser } from '@/types';

export async function getCustomers(): Promise<CustomerUser[]> {
    try {
        const pb = await getPocketBaseAdmin();

        // Fetch all users
        const records = await pb.collection('users').getFullList({
            sort: '-created'
        });

        // Map PB User to CustomerUser type
        const customers: CustomerUser[] = records.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.name || 'Cliente',
            phone: user.phone || '',
            registeredAt: user.created,
            user_metadata: {
                full_name: user.name,
                phone: user.phone
            }
        }));

        return customers;

    } catch (error) {
        console.error("Unexpected error fetching customers:", error);
        return [];
    }
}
