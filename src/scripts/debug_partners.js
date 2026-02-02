const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const SUPABASE_URL = 'https://bancodedadosds.venturexp.pro';
// Use Service Key to bypass RLS
const SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzAwNjMwNTUsImV4cCI6MjA4NTQyMzA1NX0.lITdrr5jN79Fhvuqn3eoXPd2kcHL-LWyduHa6cFGyNk';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkPartners() {
    console.log('Checking partners table...');
    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching partners:', JSON.stringify(error, null, 2));
    } else {
        console.log(`Found ${data.length} partners.`);
        console.log(data);
    }
}

checkPartners();
