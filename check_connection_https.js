
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/"/g, ''); // Simple cleanup
            env[key] = val;
        }
    });

    const url = env.NEXT_PUBLIC_SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error("Missing config");
        process.exit(1);
    }

    console.log("Checking URL:", url);
    // console.log("Key:", key.substring(0, 10) + "...");

    const target = new URL(url + '/rest/v1/');
    const options = {
        hostname: target.hostname,
        path: target.pathname,
        method: 'GET',
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key
        }
    };

    const req = https.request(options, (res) => {
        console.log('Status:', res.statusCode);
        console.log('StatusMessage:', res.statusMessage);

        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('Body:', data.substring(0, 500));
        });
    });

    req.on('error', (e) => {
        console.error('Request Error:', e);
    });

    req.end();

} catch (e) {
    console.error("Error loading .env.local:", e.message);
}
