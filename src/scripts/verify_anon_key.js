const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bancodedadosds.venturexp.pro';
// The Anon Key currently in .env.local
const ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcwMDYwNTAyLCJleHAiOjIwODU0MjA1MDJ9.G7fX9K0dd1XFdbafHqPBsiKvH-Lkzlmb8hZkKfn7YJc';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function verifyAnon() {
    console.log('Testing Anon Key...');

    // Try to list categories (public read access usually allowed)
    const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1);

    if (error) {
        console.error('ANON KEY INVALID or Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('ANON KEY VALID! Success:', data);
    }
}

verifyAnon();
