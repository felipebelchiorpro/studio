import { getPocketBaseAdmin } from '@/lib/pocketbaseAdmin';
import { Promotion } from '@/types';
import { pb as clientPb } from '@/lib/pocketbase';

const getImageUrl = (record: any) => {
    if (record.image_url) return record.image_url;
    if (record.image) return `${clientPb.baseUrl}/api/files/${record.collectionId}/${record.id}/${record.image}`;
    return '';
};

export const fetchPromotionsService = async (): Promise<Promotion[]> => {
    try {
        // Use clientPb for public access (list/view rules should be public)
        const records = await clientPb.collection('promotions').getFullList({
            sort: '-created'
        });

        return records.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            imageUrl: getImageUrl(p),
            mobileImageUrl: p.mobile_image_url || '',
            link: p.link || '',
            position: p.position || 'main_carousel'
        }));
    } catch (err) {
        console.error('Network/Unexpected Error fetching promotions:', err);
        return [];
    }
};

export const createPromotionService = async (promotion: Partial<Promotion>): Promise<Promotion | null> => {
    try {
        const pb = await getPocketBaseAdmin();
        const payload = {
            title: promotion.title,
            description: promotion.description,
            image_url: promotion.imageUrl,
            mobile_image_url: promotion.mobileImageUrl,
            link: promotion.link,
            position: promotion.position || 'main_carousel',
            active: true
        };

        const record = await pb.collection('promotions').create(payload);
        return {
            id: record.id,
            title: record.title,
            description: record.description,
            imageUrl: record.image_url,
            mobileImageUrl: record.mobile_image_url,
            link: record.link,
            position: record.position
        };
    } catch (error) {
        console.error('Error creating promotion:', error);
        throw error;
    }
};

export const updatePromotionService = async (promotion: Promotion): Promise<void> => {
    try {
        const pb = await getPocketBaseAdmin();
        const payload = {
            title: promotion.title,
            description: promotion.description,
            image_url: promotion.imageUrl,
            mobile_image_url: promotion.mobileImageUrl,
            link: promotion.link,
            position: promotion.position
        };

        await pb.collection('promotions').update(promotion.id, payload);
    } catch (error) {
        console.error('Error updating promotion:', error);
        throw error;
    }
};

export const deletePromotionService = async (id: string): Promise<void> => {
    try {
        const pb = await getPocketBaseAdmin();
        await pb.collection('promotions').delete(id);
    } catch (error) {
        console.error('Error deleting promotion:', error);
        throw error;
    }
};
