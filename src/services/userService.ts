
import { pb } from '@/lib/pocketbase';
import { CustomerUser, Address } from '@/types';


// Helper to get current user
export const getCurrentUserService = async (): Promise<CustomerUser | null> => {
    try {
        const model = pb.authStore.model;
        if (!model) return null;

        // Refresh to get latest data
        const record = await pb.collection('users').getOne(model.id);

        return {
            id: record.id,
            email: record.email,
            name: record.name,
            phone: record.phone,
            user_metadata: {
                addresses: record.addresses || []
            }
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const updateUserProfileService = async (userId: string, data: Partial<CustomerUser>): Promise<boolean> => {
    try {
        await pb.collection('users').update(userId, {
            name: data.name,
            phone: data.phone
        });
        return true;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

// Address Management
export const addAddressService = async (userId: string, address: Omit<Address, 'id'>): Promise<Address[]> => {
    const user = await pb.collection('users').getOne(userId);
    const existingAddresses: Address[] = user.addresses || [];

    const newAddress = { ...address, id: `addr_${Date.now()}` };
    const updatedAddresses = [...existingAddresses, newAddress];

    await pb.collection('users').update(userId, {
        addresses: updatedAddresses
    });

    return updatedAddresses;
};

export const updateAddressService = async (userId: string, address: Address): Promise<Address[]> => {
    const user = await pb.collection('users').getOne(userId);
    const existingAddresses: Address[] = user.addresses || [];

    const updatedAddresses = existingAddresses.map(a => a.id === address.id ? address : a);

    await pb.collection('users').update(userId, {
        addresses: updatedAddresses
    });

    return updatedAddresses;
};

export const removeAddressService = async (userId: string, addressId: string): Promise<Address[]> => {
    const user = await pb.collection('users').getOne(userId);
    const existingAddresses: Address[] = user.addresses || [];

    const updatedAddresses = existingAddresses.filter(a => a.id !== addressId);

    await pb.collection('users').update(userId, {
        addresses: updatedAddresses
    });

    return updatedAddresses;
};
