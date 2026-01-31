import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Note: This client should ONLY be used in Server Actions or API routes.
// NEVER import this in a Client Component.
// Fallback to 'build-placeholder' to prevent build failures if key is missing (Cron will fail at runtime, which is expected)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'build-missing-service-key', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
