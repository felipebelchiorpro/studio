
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key if available for RLS bypass, otherwise anon key (might fail if RLS prevents delete)
// Ideally for admin tasks we need service role.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    console.error('Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local if RLS is enabled.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanData() {
    console.log('🧹 Starting data cleanup...');

    // Delete in order of dependency (children first)

    // 1. Order Items (Depends on Orders and Products)
    console.log('Deleting order_items...');
    const { error: errorOrderItems } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all
    if (errorOrderItems) console.error('Error deleting order_items:', errorOrderItems);

    // 2. Orders (Depends on Users - usually we keep users, but here we just delete orders)
    console.log('Deleting orders...');
    const { error: errorOrders } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errorOrders) console.error('Error deleting orders:', errorOrders);

    // 3. Reviews (Depends on Products)
    console.log('Deleting reviews...');
    const { error: errorReviews } = await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errorReviews) console.error('Error deleting reviews:', errorReviews);

    // 4. Carts
    console.log('Deleting carts...');
    const { error: errorCarts } = await supabase.from('carts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errorCarts) console.error('Error deleting carts:', errorCarts);

    // 5. Products (Depends on Categories)
    console.log('Deleting products...');
    const { error: errorProducts } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errorProducts) console.error('Error deleting products:', errorProducts);

    // 6. Categories (Can be self-referencing)
    console.log('Deleting categories...');
    // If there are parent-child relationships, we might need to delete children first or rely on CASCADE.
    // Assuming CASCADE is set or flat structure for now. If fails, we might need two passes.
    const { error: errorCategories } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errorCategories) console.error('Error deleting categories:', errorCategories);

    // 7. Promotions
    console.log('Deleting promotions...');
    const { error: errorPromotions } = await supabase.from('promotions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errorPromotions) console.error('Error deleting promotions:', errorPromotions);

    console.log('✅ Cleanup complete! Database should be empty.');
}

cleanData();
