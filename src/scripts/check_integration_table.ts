import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkTable() {
    // Dynamic import to ensure env vars are loaded first
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

    console.log("Supabase URL loaded:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Checking integration_settings table...");

    const { data, error } = await supabaseAdmin.from('integration_settings').select('*');

    if (error) {
        console.error("Error accessing table:", error);
    } else {
        console.log("Table exists. Rows:", data);
        if (data && data.length === 0) {
            console.log("Table empty. Attempting seed...");
            const seedData = {
                webhook_order_created: '',
                webhook_abandoned_cart: '',
                status_order_created: false,
                status_abandoned_cart: false,
                auth_token: ''
            };
            const { error: seedError } = await supabaseAdmin.from('integration_settings').insert([seedData]);
            if (seedError) console.error("Seed error:", seedError);
            else console.log("Seeded successfully.");
        }
    }
}

checkTable();
