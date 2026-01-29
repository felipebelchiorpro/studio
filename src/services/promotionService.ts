import { supabase } from '@/lib/supabaseClient';
import { Promotion } from '@/types';

export const fetchPromotionsService = async (): Promise<Promotion[]> => {
    const { data, error } = await supabase
        .from('promotions')
        .select('*');

    if (error) {
        console.error('Error fetching promotions:', error);
        throw error;
    }

    return (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.image_url,
        link: p.link,
        position: p.position || 'main_carousel'
    }));
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

    const { data, error } = await supabase
        .from('promotions')
        .insert([dbPayload])
        .select()
        .single();

    if (error) {
        console.error('Error creating promotion:', error);
        throw error;
    }

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        link: data.link,
        position: data.position
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

    const { error } = await supabase
        .from('promotions')
        .update(dbPayload)
        .eq('id', promotion.id);

    if (error) {
        console.error('Error updating promotion:', error);
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
