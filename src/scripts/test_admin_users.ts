
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("URL:", supabaseUrl ? "Defined" : "Missing");
console.log("Service Key:", supabaseServiceKey ? "Defined (" + supabaseServiceKey.substring(0, 5) + "...)" : "Missing");

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testFetchUsers() {
    console.log("Attempting to list users...");
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error("Error fetching users:", error);
    } else {
        console.log(`Success! Found ${data.users.length} users.`);
        data.users.forEach(u => {
            console.log(`- ${u.email} (ID: ${u.id})`);
        });
    }
}

testFetchUsers();
