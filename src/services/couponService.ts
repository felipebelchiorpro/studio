
import { pb } from '@/lib/pocketbase';

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
    try {
        const records = await pb.collection('coupons').getFullList({
            sort: '-created',
            expand: 'partner'
        });

        return records.map((c: any) => ({
            id: c.id,
            code: c.code,
            discount_type: c.discount_type,
            discount_value: c.discount_value,
            expiration_date: c.expiration_date,
            usage_limit: c.usage_limit,
            active: c.active,
            created_at: c.created,
            used_count: c.used_count,
            partner_id: c.partner,
            partner_name: c.expand?.partner?.name || null,
            partners: c.expand?.partner ? { name: c.expand.partner.name } : null
        })) as Coupon[];
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }
}

export async function createCouponService(data: Omit<Coupon, 'id' | 'created_at' | 'used_count' | 'partners'>) {
    try {
        const { code, discount_type, discount_value, expiration_date, usage_limit, active, partner_name } = data;

        // If partner_name is provided, we might interpret it as a partner ID or Name?
        // Current implementation passes 'partner_name' which might just be a string if no ID.
        // But PB schema expects 'partner' relation ID.
        // Assuming we pass ID if relation, or empty if generic.
        // If partner_name is string, we can't link unless we find partner by name.
        // For now, let's assume it's optional or handled.

        const payload = {
            code: code.toUpperCase(),
            discount_type,
            discount_value,
            expiration_date,
            usage_limit,
            active,
            used_count: 0
            // partner: ...
        };

        const record = await pb.collection('coupons').create(payload);

        return {
            success: true,
            coupon: {
                id: record.id,
                code: record.code,
                // ...
            }
        };

    } catch (error: any) {
        console.error("Error creating coupon:", error);
        return { success: false, message: error.message || "Erro ao criar cupom." };
    }
}

export async function deleteCouponService(id: string) {
    try {
        await pb.collection('coupons').delete(id);
        return { success: true };
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return { success: false, message: "Erro ao excluir cupom." };
    }
}

export async function toggleCouponStatusService(id: string, currentStatus: boolean) {
    try {
        await pb.collection('coupons').update(id, { active: !currentStatus });
        return { success: true };
    } catch (error) {
        console.error("Error toggling coupon status:", error);
        return { success: false, message: "Erro ao atualizar status do cupom." };
    }
}

export async function validateCouponService(code: string) {
    try {
        const upperCode = code.toUpperCase();

        const record = await pb.collection('coupons').getFirstListItem(`code="${upperCode}"`, {
            expand: 'partner'
        });

        if (!record.active) return { valid: false, message: "Cupom inativo." };
        if (record.expiration_date && new Date(record.expiration_date) < new Date()) {
            return { valid: false, message: "Cupom expirado." };
        }
        if (record.usage_limit && record.used_count >= record.usage_limit) {
            return { valid: false, message: "Cupom esgotado." };
        }

        const partnerName = record.expand?.partner?.name || 'Cupom';

        return {
            valid: true,
            coupon: {
                code: record.code,
                type: record.discount_type,
                value: record.discount_value,
                name: partnerName.startsWith('Cupom') ? `Cupom ${record.code}` : partnerName
            },
            message: `Desconto de ${record.discount_type === 'percent' ? `${record.discount_value}%` : `R$ ${record.discount_value.toFixed(2)}`} aplicado!`
        };

    } catch (error) {
        console.error("Error validating coupon:", error);
        return { valid: false, message: "Cupom inválido ou não encontrado." };
    }
}
