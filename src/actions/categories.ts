'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Category } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(category: Partial<Category>) {
    const dbPayload = {
        name: category.name,
        image_url: category.imageUrl,
        parent_id: category.parentId || null, // Ensure null if empty/undefined
        type: category.type || 'supplement',
        // If ID is provided use it, otherwise let DB generate or generate one
        // For compatibility with current logic, let's generate if missing, or trust DB defaults if column allows
        // Since we saw 'cat-...' IDs, we stick to that pattern for consistency if needed, 
        // OR we let Supabase generate UUIDs if the column is UUID.
        // Given existing data has 'cat-...', we should probably generate one to be safe.
        id: category.id || `cat-${Date.now()}`
    };

    const { data, error } = await supabaseAdmin
        .from('categories')
        .insert([dbPayload])
        .select()
        .single();

    if (error) {
        console.error('Create Category Error:', JSON.stringify(error, null, 2));
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/categories');
    return {
        id: data.id,
        name: data.name,
        imageUrl: data.image_url,
        totalRevenue: data.total_revenue ? Number(data.total_revenue) : 0,
        parentId: data.parent_id,
        type: data.type
    };
}

export async function updateCategoryAction(category: Category) {
    const dbPayload = {
        name: category.name,
        image_url: category.imageUrl,
        parent_id: category.parentId || null,
        type: category.type
    };

    const { error } = await supabaseAdmin
        .from('categories')
        .update(dbPayload)
        .eq('id', category.id);

    if (error) {
        console.error('Update Category Error:', JSON.stringify(error, null, 2));
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/categories');
}

export async function deleteCategoryAction(categoryId: string) {
    const { error } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('id', categoryId);

    if (error) {
        console.error('Delete Category Error:', JSON.stringify(error, null, 2));
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/categories');
}
