'use server'

import { pb } from '@/lib/pocketbase';
import { Category } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(category: Partial<Category>) {
    try {
        const payload = {
            name: category.name,
            slug: category.name?.toLowerCase().replace(/ /g, '-') || `cat-${Date.now()}`,
            image: category.imageUrl, // Assuming schema updated to text
            parent_id: category.parentId || "",
            type: category.type || 'supplement'
        };

        const record = await pb.collection('categories').create(payload);

        revalidatePath('/dashboard/categories');
        return {
            id: record.id,
            name: record.name,
            imageUrl: record.image, // text
            totalRevenue: 0, // Not tracking revenue directly on category yet
            parentId: record.parent_id,
            type: record.type
        };
    } catch (error: any) {
        console.error('Create Category Error:', error);
        throw new Error(error.message || "Failed to create category");
    }
}

export async function updateCategoryAction(category: Category) {
    try {
        const payload = {
            name: category.name,
            image: category.imageUrl,
            parent_id: category.parentId || "",
            type: category.type
        };

        await pb.collection('categories').update(category.id, payload);

        revalidatePath('/dashboard/categories');
    } catch (error: any) {
        console.error('Update Category Error:', error);
        throw new Error(error.message || "Failed to update category");
    }
}

export async function deleteCategoryAction(categoryId: string) {
    try {
        await pb.collection('categories').delete(categoryId);
        revalidatePath('/dashboard/categories');
    } catch (error: any) {
        console.error('Delete Category Error:', error);
        throw new Error(error.message || "Failed to delete category");
    }
}
