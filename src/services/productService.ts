
import { supabase } from '@/lib/supabaseClient';
import type { Product, Review } from '@/types';

// Helper to map DB snake_case to Product interface camelCase
const mapProductFromDB = (dbProduct: any): Product => {
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description,
        price: Number(dbProduct.price), // Ensure number
        originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
        categoryId: dbProduct.category_id,
        category: dbProduct.categories?.name || dbProduct.category_id, // Join or raw ID fallback
        brand: dbProduct.brand,
        imageUrl: dbProduct.image_url,
        hoverImageUrl: dbProduct.hover_image_url,
        stock: dbProduct.stock,
        barcode: dbProduct.barcode,
        rating: Number(dbProduct.rating),
        salesCount: dbProduct.sales_count,
        isNewRelease: dbProduct.is_new_release,
        sizes: Array.isArray(dbProduct.sizes) ? dbProduct.sizes : [],
        colors: Array.isArray(dbProduct.colors) ? dbProduct.colors : [],
        colorMapping: Array.isArray(dbProduct.color_mapping) ? dbProduct.color_mapping : [],
        flavors: Array.isArray(dbProduct.flavors) ? dbProduct.flavors : [],
        flavorMapping: Array.isArray(dbProduct.flavor_mapping) ? dbProduct.flavor_mapping : [],
        weights: Array.isArray(dbProduct.weights) ? dbProduct.weights : [],
        // Reviews not fetched by default on list, maybe separate
        reviews: []
    };
};

export const fetchProductsService = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      categories (
        name
      )
    `)
    // .order('created_at', { ascending: false }); // Column created_at does not exist in schema


    if (error) {
        console.error('Error fetching products (Full):', JSON.stringify(error, null, 2));
        throw error;
    }

    return (data || []).map(mapProductFromDB);
};

export const fetchProductByIdService = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      categories (
        name
      ),
      reviews (*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching product ${id} (Full):`, JSON.stringify(error, null, 2));
        return null;
    }

    const product = mapProductFromDB(data);
    // Map reviews if fetched
    if (data.reviews) {
        product.reviews = data.reviews.map((r: any) => ({
            id: r.id,
            author: r.author,
            rating: r.rating,
            comment: r.comment,
            date: r.date
        }));
    }

    return product;
};

export const createProductService = async (product: Partial<Product>): Promise<Product | null> => {
    // Basic validation or default mapping
    const dbPayload = {
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.originalPrice,
        category_id: product.categoryId, // Must be ID
        brand: product.brand,
        image_url: product.imageUrl,
        hover_image_url: product.hoverImageUrl, // Added field
        stock: product.stock,
        is_new_release: product.isNewRelease,
        sizes: product.sizes,   // Added
        colors: product.colors,  // Added
        flavors: product.flavors, // Added
        flavor_mapping: product.flavorMapping, // Added
        color_mapping: product.colorMapping, // Added - Fixed missing persistence
        weights: product.weights // Added
    };
    // For now, let's assume valid ID or generate one if missing.


    // Add ID if provided (or generate simple one if missing/needed by schema constraints)
    const payloadWithId = { ...dbPayload, id: product.id || crypto.randomUUID() };

    const { data, error } = await supabase
        .from('products')
        .insert([payloadWithId])
        .select()
        .single();

    if (error) {
        console.error('Error creating product:', error);
        throw error;
    }

    // Hack: We need category NAME for the UI, but insert result won't join categories immediately usually?
    // Supabase .select('*, categories(name)') works on insert too if named right.
    return { ...mapProductFromDB(data), category: product.category || 'Nova Categoria' }; // Fallback name
};


export const updateProductService = async (product: Product): Promise<void> => {
    const dbPayload = {
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.originalPrice,
        category_id: product.categoryId,
        brand: product.brand,
        image_url: product.imageUrl,
        hover_image_url: product.hoverImageUrl, // Added field
        stock: product.stock,
        is_new_release: product.isNewRelease,
        sizes: product.sizes,   // Added
        colors: product.colors,  // Added

        flavor_mapping: product.flavorMapping, // Added
        color_mapping: product.colorMapping, // Added - Fixed missing persistence
        weights: product.weights // Added
    };

    const { error } = await supabase
        .from('products')
        .update(dbPayload)
        .eq('id', product.id);

    if (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProductService = async (productId: string): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};


const getFallbackProducts = (): Product[] => {
    return [
        {
            id: 'fallback-1',
            name: 'Whey Protein Isolado',
            description: 'Proteína de alta qualidade para recuperação muscular.',
            price: 199.90,
            originalPrice: 249.90,
            categoryId: 'cat-1',
            category: 'Proteínas',
            brand: 'DarkStore Nutrition',
            imageUrl: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Whey+Isolado',
            hoverImageUrl: 'https://placehold.co/600x400/333333/ffffff?text=Whey+Detail',
            stock: 50,
            rating: 4.8,
            salesCount: 150,
            isNewRelease: true,
            sizes: ['900g', '1.8kg'],
            colors: [],
            colorMapping: [],
            flavors: ['Chocolate', 'Baunilha', 'Morango'],
            flavorMapping: [],
            weights: [],
            reviews: []
        },
        {
            id: 'fallback-2',
            name: 'Creatina Monohidratada',
            description: 'Aumento de força e explosão muscular.',
            price: 89.90,
            categoryId: 'cat-2',
            category: 'Aminoácidos',
            brand: 'DarkStore Nutrition',
            imageUrl: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Creatina',
            hoverImageUrl: 'https://placehold.co/600x400/333333/ffffff?text=Creatina+Detail',
            stock: 100,
            rating: 4.9,
            salesCount: 300,
            isNewRelease: false,
            sizes: ['300g'],
            colors: [],
            colorMapping: [],
            flavors: ['Natural'],
            flavorMapping: [],
            weights: [],
            reviews: []
        },
        {
            id: 'fallback-3',
            name: 'Pré-Treino Insano',
            description: 'Energia extrema para seus treinos.',
            price: 129.90,
            originalPrice: 159.90,
            categoryId: 'cat-3',
            category: 'Pré-Treino',
            brand: 'DarkStore Nutrition',
            imageUrl: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Pre-Treino',
            hoverImageUrl: 'https://placehold.co/600x400/333333/ffffff?text=Pre+Detail',
            stock: 30,
            rating: 4.7,
            salesCount: 80,
            isNewRelease: true,
            sizes: ['300g'],
            colors: [],
            colorMapping: [],
            flavors: ['Uva', 'Limão'],
            flavorMapping: [],
            weights: [],
            reviews: []
        }
    ];
};

export const fetchNewReleasesService = async (limit: number = 8): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
      *,
      categories (
        name
      )
    `)
            .eq('is_new_release', true)
            .limit(limit);

        if (error || !data || data.length === 0) {
            console.warn('Using fallback products for New Releases');
            return getFallbackProducts();
        }

        return (data || []).map(mapProductFromDB);
    } catch (err) {
        console.error('Network/Unexpected Error fetching new releases:', err);
        return getFallbackProducts();
    }
};

export const fetchBestSellersService = async (limit: number = 8): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
      *,
      categories (
        name
      )
    `)
            .order('sales_count', { ascending: false })
            .limit(limit);

        if (error || !data || data.length === 0) {
            console.warn('Using fallback products for Best Sellers');
            return getFallbackProducts();
        }

        return (data || []).map(mapProductFromDB);
    } catch (err) {
        console.error('Network/Unexpected Error fetching best sellers:', err);
        return getFallbackProducts();
    }
};

export const fetchOnSaleService = async (limit: number = 8): Promise<Product[]> => {
    try {
        // Note: This is a bit tricky with Supabase basic filters if we want "original_price > price".
        // We can use .not('original_price', 'is', null) and filter in client or use a more complex query.
        // However, .gt('original_price', supabase.rpc(...)) isn't straightforward without a function.
        // For now, let's fetch products with an original_price and filter client side if the dataset is small enough, 
        // OR ideally use a raw query or an RPC.
        // Let's try to filter where original_price is not null first, then sort by discount?
        // Actually, asking for specific "on sale" usually means original_price > price.
        // If we can't do column comparison easily in standard select, we might need to fetch a bit more and filter.
        // But to be safe and fast, let's just fetch items with original_price set, assuming they are on sale.
        // Better yet: Rpc call if possible, but let's stick to standard queries for simplicity unless user has rpc.
        // We'll fetch items where original_price is not null. 

        const { data, error } = await supabase
            .from('products')
            .select(`
      *,
      categories (
        name
      )
    `)
            .not('original_price', 'is', null)
            .limit(limit * 2); // Fetch a bit more to filter client side if needed

        if (error || !data || data.length === 0) {
            console.warn('Using fallback products for On Sale');
            const fallback = getFallbackProducts();
            return fallback.filter(p => p.originalPrice);
        }

        // Client-side refinement for the comparison
        const products = (data || []).map(mapProductFromDB);
        return products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, limit);
    } catch (err) {
        console.error('Network/Unexpected Error fetching on sale products:', err);
        const fallback = getFallbackProducts();
        return fallback.filter(p => p.originalPrice);
    }
};
