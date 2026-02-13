
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRates() {
    console.log("Checking Shipping Rates...");
    const { data, error } = await supabase.from('shipping_rates').select('*');

    if (error) {
        console.error("Error fetching rates:", error.message);
        return;
    }

    console.log(`Found ${data?.length} rates.`);
    if (data && data.length > 0) {
        data.forEach(rate => {
            console.log(`- ${rate.city_name}: Active=${rate.is_active}, Fee=${rate.base_fee}`);
        });
    } else {
        console.log("No rates found in the table.");
    }
}

checkRates();
