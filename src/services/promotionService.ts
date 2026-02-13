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

// Write operations moved to server actions (src/app/actions/promotions.ts)
