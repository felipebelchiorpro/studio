const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bancodedadosds.venturexp.pro';
// The Service Role Key currently in .env.local
const SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzAwNjA1MDIsImV4cCI6MjA4NTQyMDUwMn0.XaOFp-zWCMRWackQ7RrOiGiyF8ZO3lV0tRkjemRQWGM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function verifyKey() {
    console.log('Testing Service Role Key...');

    // Try to list categories (protected table, might need RLS bypass which Service Key has)
    const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1);

    if (error) {
        console.error('KEY INVALID or Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('KEY VALID! Success:', data);
    }
}

verifyKey();
