import { supabase } from '@/lib/supabaseClient';
import { Promotion } from '@/types';

export const fetchPromotionsService = async (): Promise<Promotion[]> => {
    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('*');

        if (error) {
            console.error('Error fetching promotions:', error);
            // Don't throw, just return empty to prevent build crash
            return [];
        }

        return (data || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            imageUrl: p.image_url,
            link: p.link,
            position: p.position || 'main_carousel'
        }));
    } catch (err) {
        console.error('Network/Unexpected Error fetching promotions:', err);
        return [];
    }
};

export const createPromotionService = async (promotion: Partial<Promotion>): Promise<Promotion | null> => {
    const dbPayload = {
        title: promotion.title,
        description: promotion.description,
        image_url: promotion.imageUrl,
        link: promotion.link,
        position: promotion.position || 'main_carousel',
        id: promotion.id || `promo-${Date.now()}`
    };

    console.log('Creating promotion with payload:', dbPayload);

    const { data, error } = await supabase
        .from('promotions')
        .insert([dbPayload])
        .select();

    if (error) {
        console.error('Detailed error creating promotion:', error);
        // Special check for missing column
        if (error.message.includes('column "position" does not exist')) {
            console.warn('Fallback: "position" column missing. Retrying without it.');
            const { position, ...fallbackPayload } = dbPayload;
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('promotions')
                .insert([fallbackPayload])
                .select();

            if (fallbackError) throw fallbackError;
            if (fallbackData && fallbackData.length > 0) {
                const p = fallbackData[0];
                return {
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    imageUrl: p.image_url,
                    link: p.link,
                    position: 'main_carousel'
                };
            }
        }
        throw error;
    }

    if (!data || data.length === 0) {
        // This might happen if RLS allows insert but not reading back
        return {
            id: dbPayload.id,
            title: dbPayload.title || '',
            description: dbPayload.description || '',
            imageUrl: dbPayload.image_url || '',
            link: dbPayload.link || '',
            position: dbPayload.position as any
        };
    }

    const p = data[0];
    return {
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.image_url,
        link: p.link,
        position: p.position
    };
};

export const updatePromotionService = async (promotion: Promotion): Promise<void> => {
    const dbPayload = {
        title: promotion.title,
        description: promotion.description,
        image_url: promotion.imageUrl,
        link: promotion.link,
        position: promotion.position
    };

    console.log(`Updating promotion ${promotion.id} with payload:`, dbPayload);

    const { error } = await supabase
        .from('promotions')
        .update(dbPayload)
        .eq('id', promotion.id);

    if (error) {
        console.error('Detailed error updating promotion:', error);
        // Special check for missing column
        if (error.message.includes('column "position" does not exist')) {
            console.warn('Fallback: "position" column missing. Retrying update without it.');
            const { position, ...fallbackPayload } = dbPayload;
            const { error: fallbackError } = await supabase
                .from('promotions')
                .update(fallbackPayload)
                .eq('id', promotion.id);

            if (fallbackError) throw fallbackError;
            return;
        }
        throw error;
    }
};

export const deletePromotionService = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting promotion:', error);
        throw error;
    }
};
