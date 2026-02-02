const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bancodedadosds.venturexp.pro';
// The proven valid Anon Key
const ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcwMDYzMDU1LCJleHAiOjIwODU0MjMwNTV9.4LnVw9ttnNfCBdbtA-dCQ1e_rbWp3CqrTAV0mDnAogU';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testInsert() {
    console.log('Testing Insert with ANON KEY...');
    const { data, error } = await supabase
        .from('categories')
        .insert([
            { name: 'Debug Category Anon', type: 'supplement', image_url: '', parent_id: null }
        ])
        .select();

    if (error) {
        console.error('Insert FAILED:', JSON.stringify(error, null, 2));
    } else {
        console.log('Insert SUCCESS:', data);
        // Cleanup
        await supabase.from('categories').delete().eq('id', data[0].id);
    }
}

testInsert();
