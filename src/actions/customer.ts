'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { CustomerUser } from '@/types';

export async function getCustomers(): Promise<CustomerUser[]> {
    console.log("Fetching customers from Supabase Auth (Admin)...");

    try {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            console.error("Error fetching users from Supabase Auth:", error);
            throw new Error(error.message);
        }

        if (!users) {
            return [];
        }

        // Map Supabase User to CustomerUser type
        const customers: CustomerUser[] = users.map(user => ({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'Cliente',
            phone: user.phone || user.user_metadata?.phone,
            registeredAt: user.created_at,
            user_metadata: user.user_metadata
        }));

        // Sort by name or created_at
        return customers.sort((a, b) =>
            new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime()
        );

    } catch (error) {
        console.error("Unexpected error fetching customers:", error);
        return [];
    }
}
