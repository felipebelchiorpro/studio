
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
    console.log("No key found");
    process.exit(1);
}

const parts = key.split('.');
if (parts.length !== 3) {
    console.log("INVALID FORMAT: Key does not have 3 parts (Header.Payload.Signature)");
    console.log("Parts found:", parts.length);
    process.exit(0);
}

try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log("JWT Payload Role:", payload.role);
    console.log("JWT Iss:", payload.iss);

    if (payload.role !== 'service_role') {
        console.log("⚠️ WARNING: Key role is NOT 'service_role'. This looks like an '" + payload.role + "' key.");
    } else {
        console.log("✅ Key matches 'service_role' claims.");
    }
} catch (e: any) {
    console.log("Error decoding payload:", e.message);
}
