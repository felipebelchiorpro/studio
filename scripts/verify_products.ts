
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyProducts() {
    console.log("Fetching products...");
    const { data, error } = await supabase
        .from('products')
        .select('id, name, is_new_release, sales_count, category_id')
        //.order('id', { ascending: false }) 
        .limit(20);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Recent Products:", data);
    }
}

verifyProducts();
