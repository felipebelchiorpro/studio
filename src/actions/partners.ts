"use server";

import { PARTNERS } from "@/config/partners";
import { getPocketBaseAdmin } from "@/lib/pocketbaseAdmin";
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

    const pb = await getPocketBaseAdmin();

    try {
        await pb.collection('partners').create({
            name,
            code: code.toUpperCase().trim(),
            score: 0
        });

        revalidatePath("/dashboard/partners");
        return { success: true };
    } catch (error: any) {
        if (error.status === 400 && error.response?.data?.code?.code === "validation_not_unique") { // Unique violation
            return { error: "Este código de parceiro já existe." };
        }
        console.error("Error creating partner:", error);
        return { error: "Erro ao criar parceiro." };
    }
}

export async function deletePartner(id: string) {
    const pb = await getPocketBaseAdmin();
    try {
        await pb.collection('partners').delete(id);
        revalidatePath("/dashboard/partners");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting partner:", error);
        return { error: "Erro ao excluir parceiro." };
    }
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

    // 2. Check DB
    const pb = await getPocketBaseAdmin();
    try {
        const data = await pb.collection('partners').getFirstListItem(`code="${cleanCode}"`);
        return {
            valid: true,
            partner: data,
            discountPercentage: 7.5,
            message: `Cupom de ${data.name} aplicado! (7.5% OFF)`
        };
    } catch (error) {
        return { valid: false, message: "Cupom inválido." };
    }
}
