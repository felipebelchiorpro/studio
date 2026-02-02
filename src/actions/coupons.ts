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
    partner_id?: string | null;
    partners?: { name: string } | null;
};

export async function createCoupon(data: Omit<Coupon, 'id' | 'created_at' | 'used_count' | 'partners'>) {
    const { code, discount_type, discount_value, expiration_date, usage_limit, active, partner_id } = data;

    // Sanitize partner_id for Mock/Static mode
    // If we send a static ID (e.g. 'partner-001') to Supabase, it will fail FK constraint.
    // We set it to null so the coupon is created successfully (as General) but works via Code validation.
    const isSafeId = partner_id && !partner_id.startsWith('partner-') && !partner_id.startsWith('mock-');
    const dbPartnerId = isSafeId ? partner_id : null;

    const { data: coupon, error } = await supabaseAdmin
        .from('coupons')
        .insert([{
            code: code.toUpperCase(),
            discount_type,
            discount_value,
            expiration_date,
            usage_limit,
            active,
            partner_id: dbPartnerId
        }])
        .select()
        .single();

    if (error) {
        console.error("Error creating coupon:", error);
        return { success: false, message: "Erro ao criar cupom. Verifique se o código já existe." };
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

    // Map static partner names
    const couponsWithPartners = coupons.map((coupon: Coupon) => {
        if (coupon.partner_id) {
            const partner = PARTNERS.find(p => p.id === coupon.partner_id);
            if (partner) {
                return { ...coupon, partners: { name: partner.name } };
            }
        }
        return coupon;
    });

    return couponsWithPartners as Coupon[];
}

export async function deleteCoupon(id: string) {
    const { error } = await supabaseAdmin
        .from('coupons')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, message: "Erro ao deletar cupom." };
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
        return { success: false, message: "Erro ao atualizar status." };
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

        return {
            valid: true,
            type: 'coupon',
            discountType: coupon.discount_type,
            value: coupon.discount_value,
            name: `Cupom ${coupon.code}`,
            message: `Cupom aplicado! ${coupon.discount_type === 'percent' ? `${coupon.discount_value}% OFF` : `R$ ${coupon.discount_value} OFF`}`
        };
    }

    // 2. Check Partners (Fallback)
    const partnerValidation = await validatePartnerCode(upperCode);
    if (partnerValidation.valid) {
        return partnerValidation;
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
