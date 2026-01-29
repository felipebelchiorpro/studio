
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('Testing connection to:', supabaseUrl);

    // Try to fetch categories
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) console.error('Categories Error:', catError);
    console.log('Categories found:', categories?.length);

    // Try to fetch products (match service query)
    const { data: products, error: prodError } = await supabase.from('products').select(`
    *,
    categories (
      name
    )
  `);
    if (prodError) console.error('Products Error:', prodError);
    console.log('Products found:', products?.length);
    if (products && products.length > 0) {
        console.log('Sample Product Structure:', JSON.stringify(products[0], null, 2));
    }

    if (categories?.length === 0 && products?.length === 0) {
        console.log('\n⚠️  WARNING: Data is empty. This often means Row Level Security (RLS) is enabled but no policies Allow reading.');
    }
}

diagnose();
