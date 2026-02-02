const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bancodedadosds.venturexp.pro';
// The Known Valid Anon Key
const ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcwMDYwNTAyLCJleHAiOjIwODU0MjA1MDJ9.G7fX9K0dd1XFdbafHqPBsiKvH-Lkzlmb8hZkKfn7YJc';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testAnonPartners() {
    console.log('Testing Anon Key on partners...');
    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Anon Key FAILED on partners:', JSON.stringify(error, null, 2));
    } else {
        console.log(`Anon Key PASSED on partners! Found ${data.length} rows.`);
        console.log(data);
    }
}

testAnonPartners();
