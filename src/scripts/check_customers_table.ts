
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName: string) {
    console.log(`Checking table: ${tableName}...`);
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        console.log(`Error accessing ${tableName}:`, error.message);
        return false;
    }
    console.log(`Table ${tableName} exists. Rows found:`, data?.length ?? 0);
    return true;
}

async function main() {
    await checkTable('customers');
    await checkTable('profiles');
    await checkTable('users');
}

main();
