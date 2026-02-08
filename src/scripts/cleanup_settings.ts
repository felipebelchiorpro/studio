
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log("--- Cleanup Integration Settings ---");

    // 1. Fetch all rows
    const { data: rows, error } = await supabase
        .from('integration_settings')
        .select('*')
        .order('id', { ascending: false }); // Latest first if ID is sequential/time-based, or just grab all

    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    console.log(`Found ${rows.length} rows.`);

    if (rows.length <= 1) {
        console.log("No cleanup needed.");
        return;
    }

    // Keep the first one (most recent usually if UUIDs are v7 or if we had created_at), 
    // but without created_at, we might just pick the one with data

    // Let's pick the one that looks most "configured"
    const bestRow = rows.find(r => r.mp_access_token || r.webhook_order_created) || rows[0];

    console.log("Keeping row:", bestRow.id);

    // Delete others
    const rowsToDelete = rows.filter(r => r.id !== bestRow.id);
    const idsToDelete = rowsToDelete.map(r => r.id);

    console.log("Deleting rows:", idsToDelete);

    if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
            .from('integration_settings')
            .delete()
            .in('id', idsToDelete);

        if (deleteError) {
            console.error("Delete Error:", deleteError);
        } else {
            console.log("Cleanup Successful!");
        }
    }
}

cleanup();
