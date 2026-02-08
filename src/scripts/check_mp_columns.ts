
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkColumns() {
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

    console.log("Checking integration_settings columns...");

    // We can't easily check columns via select *, but we can try to select the specific column
    const { data, error } = await supabaseAdmin
        .from('integration_settings')
        .select('mp_access_token')
        .limit(1);

    if (error) {
        console.log("Column 'mp_access_token' likely DOES NOT exist or error:", error.message);
    } else {
        console.log("Column 'mp_access_token' exists!");
    }
}

checkColumns();
