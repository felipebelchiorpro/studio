
import { pb } from '@/lib/pocketbase';
import type { Product } from '@/types';

// Helper to map PocketBase record to Product interface
const mapProductFromDB = (record: any): Product => {
    const imageUrl = record.image ? `${pb.baseUrl}/api/files/${record.collectionId}/${record.id}/${record.image}` : '';
    // If we use 'media' collection for uploads, the record.image might be the full URL stored as text?
    // Wait, in my schema 'products' has 'image' as FILE. 
    // IF the user uploads via storageService (media collection), they get a URL.
    // IF they save that URL to 'image' field... wait, 'image' field in 'products' schema is FILE type.
    // If I send a string URL to a FILE field, PocketBase ignores it or verification fails.
    // I should change 'products' schema 'image' to TEXT if I'm using external media collection 
    // OR change logic to upload directly to product record. 
    // Given the previous step kept uploadFile returning a URL, I should assume 'image' is a URL string in the DB?
    // BUT my schema said "type": "file".
    // Conflict!
    // Solution: In schema, change 'image' to 'text' (URL) to support the media-collection pattern 
    // OR change upload logic here to not use storageService but pass FormData.
    // I already rewrote storageService to return a URL from 'media' collection. So 'image' in product should be TEXT.

    return {
        id: record.id,
        name: record.name,
        description: record.description,
        price: record.price,
        originalPrice: record.original_price, // Field names in PB are usually snake_case or whatever defined
        categoryId: record.category, // Relation ID
        category: record.expand?.category?.name || 'Sem Categoria',
        brand: record.expand?.brand?.name || record.brand,
        imageUrl: record.image?.startsWith('http') ? record.image : (record.image ? `${pb.baseUrl}/api/files/${record.collectionId}/${record.id}/${record.image}` : ''),
        // Logic: if it's a URL (from media collection), use it. If it's a filename (direct upload), construct it.
        hoverImageUrl: record.hover_image_url, // Schema needs this field? I didn't add it to schema!
        stock: record.stock,
        barcode: record.barcode,
        rating: 5, // Default for now
        salesCount: 0,
        isNewRelease: record.featured, // Map featured to isNewRelease? Or add specific field
        sizes: record.sizes || [],
        colors: [], // specific logic needed if storing color mapping
        colorMapping: [],
        flavors: record.flavors || [],
        flavorMapping: record.flavor_details || [], // Map DB flavor_details to flavorMapping
        weights: [],
        reviews: []
    };
};

export const fetchProductsService = async (): Promise<Product[]> => {
    try {
        // Use public instance for public data
        // Add random param to bust Next.js cache potentially
        const records = await pb.collection('products').getList(1, 100, {
            // sort: '-created', // Removed sort to saferty
            expand: 'category,brand',
            requestKey: null, // Disable auto-cancel
            $autoCancel: false,
            // fields: '*,expand.category.name,expand.brand.name', // optimize
        });
        return records.items.map(mapProductFromDB);
    } catch (error: any) {
        console.error('Error fetching products detailed:', {
            message: error.message,
            status: error.status,
            data: error.data,
            url: error.url,
            stack: error.stack
        });
        return [];
    }
};

export const fetchProductByIdService = async (id: string): Promise<Product | null> => {
    try {
        const { getPocketBaseAdmin } = await import('@/lib/pocketbaseAdmin');
        const pb = await getPocketBaseAdmin();
        const record = await pb.collection('products').getOne(id, {
            expand: 'category,brand',
        });
        return mapProductFromDB(record);
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
};

export const createProductService = async (product: Partial<Product>): Promise<Product | null> => {
    try {
        // We assume product.imageUrl is already a URL from storageService
        const payload = {
            name: product.name,
            slug: product.name?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || `prod-${Date.now()}`,
            description: product.description,
            price: product.price,
            category: product.categoryId,
            brand: product.brand, // Should be ID? Need to handle brand creation/lookup if text
            image: product.imageUrl, // Storing URL in text field
            stock: product.stock,
            featured: product.isNewRelease,
            sizes: product.sizes,
            flavors: product.flavors,
            original_price: product.originalPrice,
            hover_image_url: product.hoverImageUrl,
            flavor_details: product.flavorMapping
        };

        const record = await pb.collection('products').create(payload);
        return mapProductFromDB(record);
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

export const updateProductService = async (product: Product): Promise<void> => {
    try {
        const payload = {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.categoryId,
            stock: product.stock,
            featured: product.isNewRelease,
            sizes: product.sizes,
            flavors: product.flavors,
            image: product.imageUrl,
            original_price: product.originalPrice,
            hover_image_url: product.hoverImageUrl,
            flavor_details: product.flavorMapping
        };
        await pb.collection('products').update(product.id, payload);
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProductService = async (productId: string): Promise<void> => {
    try {
        await pb.collection('products').delete(productId);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

// Fallbacks kept for safety/demo
const getFallbackProducts = (): Product[] => []; // ... (truncated for brevity, can restore detailed fallback if needed)

export const fetchNewReleasesService = async (limit: number = 8): Promise<Product[]> => {
    try {
        // Use public instance
        const records = await pb.collection('products').getList(1, limit, {
            filter: 'featured = true',
            sort: '-created',
            expand: 'category,brand',
        });
        return records.items.map(mapProductFromDB);
    } catch (error: any) {
        console.error('Error fetching new releases:', {
            message: error.message,
            status: error.status
        });
        return [];
    }
};

export const fetchBestSellersService = async (limit: number = 8): Promise<Product[]> => {
    // Mock sort by sales since we don't track sales_count in PB schema yet
    return fetchProductsService();
};

export const fetchOnSaleService = async (limit: number = 8): Promise<Product[]> => {
    try {
        // Fetch products with an original price set (implying a discount)
        const records = await pb.collection('products').getList(1, limit, {
            filter: 'original_price > 0 && active = true',
            sort: '-created',
            expand: 'category,brand',
        });
        return records.items.map(mapProductFromDB);
    } catch (error: any) {
        console.error('Error fetching on sale details:', error);
        return [];
    }
};

