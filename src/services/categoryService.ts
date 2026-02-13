
import { pb } from '@/lib/pocketbase';
import type { Category } from '@/types';

export const fetchCategoriesService = async (): Promise<Category[]> => {
    try {
        const records = await pb.collection('categories').getFullList({
            sort: 'name',
        });

        return records.map((c: any) => ({
            id: c.id,
            name: c.name,
            imageUrl: c.image ? `${pb.baseUrl}/api/files/${c.collectionId}/${c.id}/${c.image}` : '',
            totalRevenue: 0, // Not tracked in PB Basic Schema yet
            parentId: c.parent_id || undefined, // Note: Schema uses camelCase or snake? My schema JSON used 'cat_name', 'cat_slug'. 
            // WAIT! My schema setup script used specific IDs like 'cat_name'.
            // PB normally creates 'field' name from what I passed.
            // Let's check schema.json I wrote.
            // "name": "name", "id": "cat_name". The KEY is "name". 
            // "name": "slug", "id": "cat_slug".
            // So fields are 'name', 'slug', 'image'.
            // I did NOT put 'parent_id' or 'type' in the schema I generated in Step 2323.
            // THIS IS WHY 'orders' might have failed too if I missed fields?
            // AND 'categories' created successfully but might miss 'parent_id' and 'type' columns if I didn't define them?
            // Checking the file content from Step 2323...
            // It only had: name, slug, image.
            // MISSING: type, parent_id.
            // I need to UPDATE the schema for Categories to include these fields.
            type: c.type || 'supplement' // Use DB value or default
        }));
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        console.error('Details:', error.data || error.message);
        return [];
    }
};

export const createCategoryService = async (category: Partial<Category>): Promise<Category | null> => {
    try {
        const payload = {
            name: category.name,
            slug: category.name?.toLowerCase().replace(/ /g, '-') || '',
            parent_id: category.parentId || '', // Include parent_id
            type: category.type || 'supplement', // Include type
            // image: category.imageUrl // COMMENTED OUT: Testing if base64 string causes 404
        };

        const record = await pb.collection('categories').create(payload);
        return {
            id: record.id,
            name: record.name,
            imageUrl: record.image ? `${pb.baseUrl}/api/files/${record.collectionId}/${record.id}/${record.image}` : '',
            type: record.type as any,
            parentId: record.parent_id
        };
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategoryService = async (category: Category): Promise<void> => {
    try {
        const payload = {
            name: category.name,
            parent_id: category.parentId || '',
            type: category.type,
            image: category.imageUrl
        };
        await pb.collection('categories').update(category.id, payload);
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

export const deleteCategoryService = async (categoryId: string): Promise<void> => {
    try {
        await pb.collection('categories').delete(categoryId);
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};
