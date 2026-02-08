
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Service Key:', supabaseServiceKey ? 'Set (Length: ' + supabaseServiceKey?.length + ')' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('ERROR: Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
    console.log('Testing connection...');
    const { data, error } = await supabase.from('shipping_rates').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('CONNECTION FAILED');
        console.error('Error Details:', JSON.stringify(error, null, 2));
    } else {
        console.log('CONNECTION SUCCESSFUL. Count:', data);
    }
}

testConnection();
