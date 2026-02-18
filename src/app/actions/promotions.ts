'use server';

import { getPocketBaseAdmin } from '@/lib/pocketbaseAdmin';
import { Promotion } from '@/types';
import { revalidatePath } from 'next/cache';
import { pb as clientPb } from '@/lib/pocketbase';

const getImageUrl = (record: any) => {
    if (record.image_url) return record.image_url;
    if (record.image) return `${clientPb.baseUrl}/api/files/${record.collectionId}/${record.id}/${record.image}`;
    return '';
};

export async function fetchPromotions(): Promise<Promotion[]> {
    try {
        const pb = await getPocketBaseAdmin();
        const records = await pb.collection('promotions').getFullList({
            sort: '-created'
        });

        return records.map((p: any) => ({
            id: p.id,
            title: p.name,
            description: p.description,
            imageUrl: getImageUrl(p),
            mobileImageUrl: p.mobile_image_url || '',
            link: p.link || '',
            position: p.position || 'main_carousel',
            active: p.active
        }));
    } catch (error: any) {
        console.error('Error fetching promotions:', error);
        return [];
    }
}

export async function createPromotion(promotion: Partial<Promotion>): Promise<Promotion | null> {
    try {
        const pb = await getPocketBaseAdmin();
        const payload = {
            name: promotion.title || `Banner ${new Date().toLocaleString()}`,
            description: promotion.description,
            image_url: promotion.imageUrl,
            mobile_image_url: promotion.mobileImageUrl,
            link: promotion.link,
            position: promotion.position || 'main_carousel',
            active: true
        };

        const record = await pb.collection('promotions').create(payload);

        revalidatePath('/dashboard/promotions');
        revalidatePath('/dashboard/appearance');
        revalidatePath('/'); // Revalidate home as banners appear there

        return {
            id: record.id,
            title: record.name,
            description: record.description,
            imageUrl: record.image_url,
            mobileImageUrl: record.mobile_image_url,
            link: record.link,
            position: record.position
        };
    } catch (error: any) {
        console.error('Error creating promotion:', error);
        throw new Error(error.message || 'Failed to create promotion');
    }
}

export async function updatePromotion(promotion: Promotion): Promise<void> {
    try {
        const pb = await getPocketBaseAdmin();
        const payload = {
            name: promotion.title || `Banner ${new Date().toLocaleString()}`,
            description: promotion.description,
            image_url: promotion.imageUrl,
            mobile_image_url: promotion.mobileImageUrl,
            link: promotion.link,
            position: promotion.position,
            active: promotion.active !== undefined ? promotion.active : true // Preserve active status or default to true
        };

        await pb.collection('promotions').update(promotion.id, payload);

        revalidatePath('/dashboard/promotions');
        revalidatePath('/dashboard/appearance');
        revalidatePath('/');
    } catch (error: any) {
        console.error('Error updating promotion:', error);
        throw new Error(error.message || 'Failed to update promotion');
    }
}

export async function deletePromotion(id: string): Promise<void> {
    try {
        const pb = await getPocketBaseAdmin();
        await pb.collection('promotions').delete(id);

        revalidatePath('/dashboard/promotions');
        revalidatePath('/dashboard/appearance');
        revalidatePath('/');
    } catch (error: any) {
        console.error('Error deleting promotion:', error);
        throw new Error(error.message || 'Failed to delete promotion');
    }
}
