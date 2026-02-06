'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

import { validatePartnerCode } from "./partners";
import { PARTNERS } from "@/config/partners";

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
    partner_id?: string | null; // Deprecated but kept for compatibility
    partner_name?: string | null; // New Simple Field
    partners?: { name: string } | null; // Legacy Join
};

export async function createCoupon(data: Omit<Coupon, 'id' | 'created_at' | 'used_count' | 'partners'>) {
    const { code, discount_type, discount_value, expiration_date, usage_limit, active, partner_name } = data;

    const { data: coupon, error } = await supabaseAdmin
        .from('coupons')
        .insert([{
            code: code.toUpperCase(),
            discount_type,
            discount_value,
            expiration_date,
            usage_limit,
            active,
            partner_name: partner_name || null // Store the name directly
        }])
        .select()
        .single();

    if (error) {
        console.error("Error creating coupon:", error);
        if (error.code === '23505') { // Postgres unique_violation code
            return { success: false, message: "Este código de cupom já existe." };
        }
        return { success: false, message: "Erro ao criar cupom. Tente novamente." };
    }

    revalidatePath('/dashboard/coupons');
    return { success: true, coupon };
}

export async function getCoupons() {
    const { data: coupons, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }

    // No mapping needed for partner_name, it's directly in the row now.
    return coupons as Coupon[];
}

export async function deleteCoupon(id: string) {
    const { error } = await supabaseAdmin
        .from('coupons')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting coupon:", error);
        return { success: false, message: "Erro ao excluir cupom." };
    }

    revalidatePath('/dashboard/coupons');
    return { success: true };
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
    const { error } = await supabaseAdmin
        .from('coupons')
        .update({ active: !currentStatus })
        .eq('id', id);

    if (error) {
        console.error("Error toggling coupon status:", error);
        return { success: false, message: "Erro ao atualizar status do cupom." };
    }

    revalidatePath('/dashboard/coupons');
    return { success: true };
}

export async function validateCoupon(code: string) {
    const upperCode = code.toUpperCase();

    // 1. Check Custom Coupons
    const { data: coupon, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', upperCode)
        .single();

    if (coupon) {
        if (!coupon.active) return { valid: false, message: "Cupom inativo." };
        if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
            return { valid: false, message: "Cupom expirado." };
        }
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return { valid: false, message: "Cupom esgotado." };
        }

        // Use stored partner_name if available
        const partnerName = coupon.partner_name || 'Cupom';

        return {
            valid: true,
            type: 'coupon',
            discountType: coupon.discount_type,
            value: coupon.discount_value,
            name: partnerName.startsWith('Cupom') ? `Cupom ${coupon.code}` : partnerName,
            message: `Desconto aplicado! ${coupon.discount_type === 'percent' ? `${coupon.discount_value}% OFF` : `R$ ${coupon.discount_value} OFF`}`
        };
    }

    // 2. Check Partners (Legacy Fallback - can be removed if unused)
    const partnerValidation = await validatePartnerCode(upperCode);
    if (partnerValidation.valid) {
        return {
            valid: true,
            discountType: 'percent',
            value: partnerValidation.discountPercentage,
            name: partnerValidation.partner?.name || 'Parceiro',
            message: partnerValidation.message
        };
    }

    return { valid: false, message: "Cupom inválido." };
}

export async function incrementCouponUsage(code: string) {
    const { data: coupon, error: fetchError } = await supabaseAdmin
        .from('coupons')
        .select('id, used_count')
        .eq('code', code)
        .single();

    if (fetchError || !coupon) {
        // Not a managed coupon (maybe partner code or invalid)
        return;
    }

    const { error: updateError } = await supabaseAdmin
        .from('coupons')
        .update({ used_count: (coupon.used_count || 0) + 1 })
        .eq('id', coupon.id);

    if (updateError) {
        console.error(`Failed to increment usage for coupon ${code}`, updateError);
    } else {
        revalidatePath('/dashboard/coupons');
    }
}
