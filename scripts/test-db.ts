
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
// Load .env first, then .env.local (overrides)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl ? "Found" : "Missing");
console.log("Key:", supabaseAnonKey ? "Found" : "Missing");

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log("Testing connection...");
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name')
        .limit(5);

    if (error) {
        console.error("Error fetching products:", error);
    } else {
        console.log("Successfully fetched products:", products);
        console.log("Count:", products.length);
    }

    // Check categories too
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .limit(5);

    if (catError) {
        console.error("Error fetching categories:", catError);
    } else {
        console.log("Successfully fetched categories:", categories);
    }
}

testConnection();
