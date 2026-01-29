"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function getPartners() {
    const { data, error } = await supabaseAdmin
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching partners:", error);
        return [];
    }
    return data;
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
