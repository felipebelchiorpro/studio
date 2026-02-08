
import { supabase } from '@/lib/supabaseClient';

export type Coupon = {
    id: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    expiration_date?: string | null;
    usage_limit?: number | null;
    active: boolean;
    created_at?: string;
    used_count: number;
    partner_id?: string | null;
    partner_name?: string | null;
    partners?: { name: string } | null;
};

export async function fetchCouponsService() {
    const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }

    return coupons as Coupon[];
}

export async function createCouponService(data: Omit<Coupon, 'id' | 'created_at' | 'used_count' | 'partners'>) {
    const { code, discount_type, discount_value, expiration_date, usage_limit, active, partner_name } = data;

    const { data: coupon, error } = await supabase
        .from('coupons')
        .insert([{
            code: code.toUpperCase(),
            discount_type,
            discount_value,
            expiration_date,
            usage_limit,
            active,
            partner_name: partner_name || null
        }])
        .select()
        .single();

    if (error) {
        console.error("Error creating coupon:", JSON.stringify(error, null, 2));
        if (error.code === '23505') {
            return { success: false, message: "Este código de cupom já existe." };
        }
        return { success: false, message: error.message || "Erro ao criar cupom. Verifique as permissões." };
    }

    return { success: true, coupon };
}

export async function deleteCouponService(id: string) {
    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting coupon:", error);
        return { success: false, message: "Erro ao excluir cupom." };
    }

    return { success: true };
}

export async function toggleCouponStatusService(id: string, currentStatus: boolean) {
    const { error } = await supabase
        .from('coupons')
        .update({ active: !currentStatus })
        .eq('id', id);

    if (error) {
        console.error("Error toggling coupon status:", error);
        return { success: false, message: "Erro ao atualizar status do cupom." };
    }

    return { success: true };
}
