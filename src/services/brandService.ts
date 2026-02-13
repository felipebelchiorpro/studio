
import { pb } from '@/lib/pocketbase';
import type { Brand } from '@/types';

export const fetchBrandsService = async (): Promise<Brand[]> => {
    try {
        const records = await pb.collection('brands').getFullList({
            sort: 'name',
        });

        return records.map((b: any) => ({
            id: b.id,
            name: b.name,
            imageUrl: b.logo?.startsWith('http') ? b.logo : (b.logo ? `${pb.baseUrl}/api/files/${b.collectionId}/${b.id}/${b.logo}` : '')
        }));
    } catch (error) {
        console.error('Error fetching brands:', error);
        return [];
    }
};

export const createBrandService = async (brand: Omit<Brand, 'id'>): Promise<Brand | null> => {
    try {
        // We need to handle file upload if imageUrl is a File object, but here it comes as string URL mostly?
        // If the context passes a URL (from storageService), and we want to save it to 'logo' (file field)...
        // Again, same issue as Products/Categories if we use external media collection.
        // For now, let's assume we might change schema to TEXT for logo or handle it.
        // But wait, the context `addBrand` receives `imageUrl`.

        const payload = {
            name: brand.name,
            slug: brand.name.toLowerCase().replace(/ /g, '-'),
            logo: brand.imageUrl // Now schema is TEXT, so can store URL
        };

        const record = await pb.collection('brands').create(payload);
        return {
            id: record.id,
            name: record.name,
            imageUrl: record.logo ? `${pb.baseUrl}/api/files/${record.collectionId}/${record.id}/${record.logo}` : ''
        };
    } catch (error) {
        console.error('Error creating brand:', error);
        throw error;
    }
};

export const deleteBrandService = async (brandId: string): Promise<void> => {
    try {
        await pb.collection('brands').delete(brandId);
    } catch (error) {
        console.error('Error deleting brand:', error);
        throw error;
    }
};
