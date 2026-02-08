
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function updateName() {
    const email = 'contatofelipebelchior@gmail.com';

    // 1. Get User ID
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error listing users", error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error("User not found:", email);
        return;
    }

    console.log("Found user:", user.id, user.user_metadata);

    // 2. Update Metadata
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, name: 'Felipe Belchior' } }
    );

    if (updateError) {
        console.error("Error updating user:", updateError);
    } else {
        console.log("Successfully updated user name to 'Felipe Belchior'");
        console.log("New Metadata:", data.user.user_metadata);
    }
}

updateName();
