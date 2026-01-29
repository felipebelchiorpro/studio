
import { createClient } from '@supabase/supabase-js';
import { mockCategories, mockProducts, mockReviews, mockOrders, mockPromotions } from '../src/data/mockData';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🌱 Starting seeding process...');

    // 1. Categories
    console.log('Insert categories...');
    const result = await supabase.from('categories').upsert(
        mockCategories.map(c => ({
            id: c.id,
            name: c.name,
            image_url: c.imageUrl,
            total_revenue: c.totalRevenue
        }))
    );
    const catError = result.error;
    if (catError) {
        console.error('Error seeding categories:', catError);
        // @ts-ignore
        console.error('Status:', result.status, result.statusText);
    }

    // 2. Products
    console.log('Inserting products...');
    // Need to map category text to id if possible, but mock data uses category NAME as category usually, but let's check.
    // In mockData: category: 'GANHO DE MASSA', categories list has id: 'catGanhoMassa', name: 'GANHO DE MASSA'
    // So we need to map product.category (name) to category.id

    const productsPayload = mockProducts.map(p => {
        // Find category ID by name
        const category = mockCategories.find(c => c.name === p.category);
        const categoryId = category ? category.id : null;

        return {
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            original_price: p.originalPrice,
            category_id: categoryId,
            brand: p.brand,
            image_url: p.imageUrl,
            stock: p.stock,
            barcode: p.barcode,
            rating: p.rating,
            sales_count: p.salesCount,
            is_new_release: p.isNewRelease
        };
    });

    const { error: prodError } = await supabase.from('products').upsert(productsPayload);
    if (prodError) console.error('Error seeding products:', prodError);

    // 3. Reviews
    console.log('Inserting reviews...');
    // Mock products have reviews nested. We need to extract them.
    let allReviews: any[] = [];
    mockProducts.forEach(p => {
        if (p.reviews) {
            p.reviews.forEach(r => {
                allReviews.push({
                    id: r.id,
                    product_id: p.id,
                    author: r.author,
                    rating: r.rating,
                    comment: r.comment,
                    date: r.date
                });
            });
        }
    });

    // Also mockData.mockReviews exists, but they might be same instances.
    // Let's use the ones extracted from products to ensure foreign keys match.
    if (allReviews.length > 0) {
        const { error: revError } = await supabase.from('reviews').upsert(allReviews);
        if (revError) console.error('Error seeding reviews:', revError);
    }


    // 4. Orders
    console.log('Inserting orders...');
    const ordersPayload = mockOrders.map(o => ({
        id: o.id,
        user_id: o.userId,
        total_amount: o.totalAmount,
        order_date: o.orderDate,
        status: o.status,
        channel: o.channel
    }));

    const { error: ordError } = await supabase.from('orders').upsert(ordersPayload);
    if (ordError) console.error('Error seeding orders:', ordError);

    // 5. Order Items
    console.log('Inserting order items...');
    let allOrderItems: any[] = [];
    mockOrders.forEach(o => {
        o.items.forEach(item => {
            allOrderItems.push({
                order_id: o.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: item.price
            });
        });
    });

    const { error: itemError } = await supabase.from('order_items').upsert(allOrderItems, { onConflict: 'id' }); // id is auto uuid, so upsert migth be tricky without specific IDs. 
    // Actually, for order_items, typically we just insert. But if we run seed multiple times, we might duplicate.
    // For simplicity in this seed script, let's just insert.

    // Better approach for order_items if we want idempotency: DELETE all for these orders first? 
    // Or just ignore if we don't have IDs. 
    // Let's try direct insert, and caveat that running twice duplicates items.
    // OR, generated UUIDs in code if we wanted persistence.

    if (allOrderItems.length > 0) {
        // Using simple insert for items since we don't have stable IDs in mock data for items
        // To prevent duplication on re-runs, we *could* delete relevant order items first, but that's risky.
        // Let's just insert and warn user.
        const { error: itemsInsertError } = await supabase.from('order_items').insert(allOrderItems);
        if (itemsInsertError) console.error('Error seeding order items:', itemsInsertError);
    }

    // 6. Promotions
    console.log('Inserting promotions...');
    const promoPayload = mockPromotions.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image_url: p.imageUrl,
        link: p.link
    }));
    const { error: promoError } = await supabase.from('promotions').upsert(promoPayload);
    if (promoError) console.error('Error seeding promotions:', promoError);


    console.log('✅ Seeding complete!');
}

seed();
