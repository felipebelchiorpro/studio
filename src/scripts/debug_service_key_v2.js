const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bancodedadosds.venturexp.pro';
// Using the NEW Service Key generated in Step 1141
const SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzAwNjMwNTUsImV4cCI6MjA4NTQyMzA1NX0.lITdrr5jN79Fhvuqn3eoXPd2kcHL-LWyduHa6cFGyNk';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function testServiceKey() {
    console.log('Testing Service Key on categories...');
    const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('count')
        .limit(1);

    if (catError) {
        console.error('Service Key FAILED on categories:', JSON.stringify(catError, null, 2));
    } else {
        console.log('Service Key PASSED on categories!');
    }

    console.log('Testing Service Key on partners...');
    const { data: parts, error: partError } = await supabase
        .from('partners')
        .select('count')
        .limit(1);

    if (partError) {
        console.error('Service Key FAILED on partners:', JSON.stringify(partError, null, 2));
    } else {
        console.log('Service Key PASSED on partners!');
    }
}

testServiceKey();
