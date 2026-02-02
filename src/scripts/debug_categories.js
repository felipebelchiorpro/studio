const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const SUPABASE_URL = 'https://bancodedadosds.venturexp.pro';
// Using the Key generated in Step 965 which is the valid one
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcwMDYwNTAyLCJleHAiOjIwODU0MjA1MDJ9.G7fX9K0dd1XFdbafHqPBsiKvH-Lkzlmb8hZkKfn7YJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listCategories() {
    console.log('Fetching categories...');
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${categories.length} categories.`);

    // Build Tree
    const roots = categories.filter(c => !c.parent_id);

    roots.forEach(root => {
        console.log(`[ROOT] ${root.name} (ID: ${root.id}, Type: ${root.type})`);
        printChildren(root.id, categories, 1);
    });

    // Find orphans (orphaned children)
    const orphans = categories.filter(c => c.parent_id && !categories.find(p => p.id === c.parent_id));
    if (orphans.length > 0) {
        console.log('--- ORPHANS (Parent Not Found) ---');
        orphans.forEach(o => console.log(`[ORPHAN] ${o.name} (Parent: ${o.parent_id})`));
    }
}

function printChildren(parentId, allCategories, level) {
    const children = allCategories.filter(c => c.parent_id === parentId);
    const indent = '  '.repeat(level);

    children.forEach(child => {
        console.log(`${indent}└─ ${child.name} (ID: ${child.id}, Type: ${child.type})`);
        printChildren(child.id, allCategories, level + 1);
    });
}

listCategories();
