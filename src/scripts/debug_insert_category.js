const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bancodedadosds.venturexp.pro';
// Using the Key generated in Step 965
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcwMDYwNTAyLCJleHAiOjIwODU0MjA1MDJ9.G7fX9K0dd1XFdbafHqPBsiKvH-Lkzlmb8hZkKfn7YJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
    console.log('Attempting to insert sub-category...');

    // Use known parent ID from debug output
    const parentId = 'cat-1769919655010';
    const newId = `cat-debug-${Date.now()}`;

    const payload = {
        id: newId,
        name: 'Debug Subcategory',
        parent_id: parentId,
        type: 'supplement'
    };

    const { data, error } = await supabase
        .from('categories')
        .insert([payload])
        .select();

    if (error) {
        console.error('INSERT FAILED:', JSON.stringify(error, null, 2));
    } else {
        console.log('INSERT SUCCESS:', data);
    }
}

testInsert();
