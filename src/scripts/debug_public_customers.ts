
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Checking public.customers table...");
console.log("URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    const { data, error, count } = await supabase
        .from('customers')
        .select('*', { count: 'exact' });

    if (error) {
        console.error("Error querying customers:", error);
    } else {
        console.log(`Found ${count} customers in public table.`);
        if (data && data.length > 0) {
            console.log("Sample customer:", data[0]);
        } else {
            console.log("Table 'public.customers' is empty.");

            // Try to insert a dummy to verify Write access
            console.log("Attempting to insert dummy record...");
            const dummyId = '00000000-0000-0000-0000-000000000000'; // Invalid UUID for auth, but valid for text? No, it's UUID.
            // FK constraint will fail if auth.users doesn't have this ID. 
            // We can't insert into public.customers because of FK constraint to auth.users!
            console.log("Skipping insert due to FK constraint.");
        }
    }
}

checkTable();
