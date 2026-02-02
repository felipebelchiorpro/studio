const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bancodedadosds.venturexp.pro';
// User provided key from Step 1341
const USER_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcwMDYzMDU1LCJleHAiOjIwODU0MjMwNTV9.4LnVw9ttnNfCBdbtA-dCQ1e_rbWp3CqrTAV0mDnAogU';

const supabase = createClient(SUPABASE_URL, USER_ANON_KEY);

async function testUserAnon() {
    console.log('Testing USER PROVIDED Anon Key...');
    const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1);

    if (error) {
        console.error('USER KEY FAILED:', JSON.stringify(error, null, 2));
    } else {
        console.log('USER KEY SUCCESS! Data:', data);
    }
}

testUserAnon();
