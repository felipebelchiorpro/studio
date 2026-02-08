
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch'; // Standard fetch might be available in node 18+ but let's see

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.log("Missing config");
    process.exit(1);
}

const target = `${url}/rest/v1/`;
console.log("Target:", target);

async function check() {
    try {
        const res = await fetch(target, {
            headers: {
                apikey: key,
                Authorization: `Bearer ${key}`
            }
        });
        console.log("Status:", res.status);
        console.log("StatusText:", res.statusText);
        const text = await res.text();
        console.log("Body:", text.substring(0, 500));
    } catch (e: any) {
        console.log("Fetch Error:", e.message);
    }
}

check();
