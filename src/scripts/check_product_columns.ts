
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("--- Check Product Columns ---");
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        if (data && data.length > 0) {
            console.log("Product Keys:", Object.keys(data[0]));
            console.log("Sample Data:", data[0]);
        } else {
            console.log("No products found to check columns.");
        }
    }
}

check();
