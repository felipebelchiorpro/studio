'use server';

import { getPocketBaseAdmin } from "@/lib/pocketbaseAdmin";
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
    partner_name?: string | null;
    partners?: { name: string } | null;
};

export async function createCoupon(data: Omit<Coupon, 'id' | 'created_at' | 'used_count' | 'partners'>) {
    const { code, discount_type, discount_value, expiration_date, usage_limit, active, partner_name } = data;

    const pb = await getPocketBaseAdmin();

    try {
        const payload = {
            code: code.toUpperCase(),
            discount_type,
            discount_value,
            expiration_date: expiration_date ? new Date(expiration_date).toISOString() : null,
            usage_limit,
            active,
            partner_name: partner_name || null,
            usage_count: 0
        };

        const coupon = await pb.collection('coupons').create(payload);

        revalidatePath('/dashboard/coupons');
        return { success: true, coupon };
    } catch (error: any) {
        console.error("Error creating coupon:", error);
        if (error.status === 400 && error.response?.data?.code?.code === "validation_not_unique") {
            return { success: false, message: "Este código de cupom já existe." };
        }
        return { success: false, message: error.message || "Erro ao criar cupom." };
    }
}

export async function getCoupons() {
    const pb = await getPocketBaseAdmin();
    try {
        const coupons = await pb.collection('coupons').getFullList({
            sort: '-created',
        });
        return coupons.map((c: any) => ({
            id: c.id,
            code: c.code,
            discount_type: c.discount_type,
            discount_value: c.discount_value,
            expiration_date: c.expiration_date,
            usage_limit: c.usage_limit,
            active: c.active,
            created_at: c.created,
            used_count: c.used_count,
            partner_name: c.partner_name,
        })) as Coupon[];
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }
}

export async function deleteCoupon(id: string) {
    const pb = await getPocketBaseAdmin();
    try {
        await pb.collection('coupons').delete(id);
        revalidatePath('/dashboard/coupons');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting coupon:", error);
        return { success: false, message: "Erro ao excluir cupom." };
    }
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
    const pb = await getPocketBaseAdmin();
    try {
        await pb.collection('coupons').update(id, { active: !currentStatus });
        revalidatePath('/dashboard/coupons');
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling coupon status:", error);
        return { success: false, message: "Erro ao atualizar status do cupom." };
    }
}

export async function validateCoupon(code: string) {
    const upperCode = code.toUpperCase();
    const pb = await getPocketBaseAdmin();

    try {
        // 1. Check Custom Coupons
        const coupon = await pb.collection('coupons').getFirstListItem(`code="${upperCode}"`);

        if (coupon) {
            if (!coupon.active) return { valid: false, message: "Cupom inativo." };
            if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
                return { valid: false, message: "Cupom expirado." };
            }
            if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
                return { valid: false, message: "Cupom esgotado." };
            }

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
    } catch (e: any) {
        if (e.status !== 404) {
            console.error("Error validating coupon:", e);
        }
        // Not found, try logic below
    }

    // 2. Check Partners (Legacy Fallback)
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
    const pb = await getPocketBaseAdmin();
    try {
        const coupon = await pb.collection('coupons').getFirstListItem(`code="${code}"`);
        await pb.collection('coupons').update(coupon.id, {
            used_count: (coupon.used_count || 0) + 1
        });
        revalidatePath('/dashboard/coupons');
    } catch (error) {
        // Ignore if not found or error
    }
}
