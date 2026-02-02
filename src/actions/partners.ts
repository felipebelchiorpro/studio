"use server";

import { PARTNERS } from "@/config/partners";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function getPartners() {
    // Return static partners to ensure functionality without DB Auth
    return PARTNERS;
}

export async function createPartner(formData: FormData) {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    if (!name || !code) {
        return { error: "Nome e Código são obrigatórios." };
    }

    const { error } = await supabaseAdmin.from("partners").insert({
        name,
        code: code.toUpperCase().trim(),
        score: 0
    });

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { error: "Este código de parceiro já existe." };
        }
        console.error("Error creating partner:", error);
        return { error: "Erro ao criar parceiro." };
    }

    revalidatePath("/dashboard/partners");
    return { success: true };
}

export async function deletePartner(id: string) {
    const { error } = await supabaseAdmin.from("partners").delete().match({ id });

    if (error) {
        console.error("Error deleting partner:", error);
        return { error: "Erro ao excluir parceiro." };
    }

    revalidatePath("/dashboard/partners");
    return { success: true };
}

export async function validatePartnerCode(code: string) {
    // Clean input
    const cleanCode = code.trim().toUpperCase();

    // 1. Check Static Partners First
    const staticPartner = PARTNERS.find(p => p.code === cleanCode);
    if (staticPartner) {
        return {
            valid: true,
            partner: staticPartner,
            discountPercentage: 7.5,
            message: `Cupom de ${staticPartner.name} aplicado! (7.5% OFF)`
        };
    }

    // 2. Check DB (Fallback, might fail with current keys)
    const { data, error } = await supabaseAdmin
        .from("partners")
        .select("name, code")
        .eq("code", cleanCode)
        .single();

    if (error || !data) {
        return { valid: false, message: "Cupom inválido." };
    }

    return {
        valid: true,
        partner: data,
        discountPercentage: 7.5,
        message: `Cupom de ${data.name} aplicado! (7.5% OFF)`
    };
}
