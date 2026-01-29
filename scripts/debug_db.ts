
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    console.log("Attempting INSERT to discover schema...");
    // Try minimal fields based on what we know exists (total_amount)
    const { data: inserted, error: insertError } = await supabase
        .from('orders')
        .insert([{ id: 'test-dbg-1', total_amount: 10.00, user_id: 'guest-123' }])
        .select();

    if (insertError) {
        console.log("Insert failed:", insertError.message);
        // Error message often says "null value in column 'foo' violates not-null constraint"
        // This gives us the column name 'foo'!!
    } else {
        console.log("Insert SUCCESS!");
        if (inserted && inserted.length > 0) {
            console.log("Discovered keys:", Object.keys(inserted[0]));
            // Clean up
            await supabase.from('orders').delete().eq('id', inserted[0].id); // Assuming 'id' exists
        }
    }
}

inspect();
