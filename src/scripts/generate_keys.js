const crypto = require('crypto');

const secret = 'zwXD7ioa5th9whQU4R04tpYU7PIPgIon';

function sign(payload, secret) {
    const parts = [];

    // Header
    const header = { typ: 'JWT', alg: 'HS256' };
    parts.push(Buffer.from(JSON.stringify(header)).toString('base64url'));

    // Payload
    parts.push(Buffer.from(JSON.stringify(payload)).toString('base64url'));

    // Signature
    const signature = crypto
        .createHmac('sha256', secret)
        .update(parts.join('.'))
        .digest('base64url');

    return parts.join('.') + '.' + signature;
}

// Backdate IAT by 1 hour to prevent "token from future" errors due to clock skew
const iat = Math.floor(Date.now() / 1000) - 3600;
const exp = iat + (60 * 60 * 24 * 365 * 10); // 10 years

const anonPayload = {
    role: 'anon',
    iss: 'supabase',
    iat,
    exp
};

const servicePayload = {
    role: 'service_role',
    iss: 'supabase',
    iat,
    exp
};

console.log('--- SUPABASE KEYS GENERATED ---');
console.log('ANON_KEY:');
console.log(sign(anonPayload, secret));
console.log('-------------------------------');
console.log('SERVICE_ROLE_KEY:');
console.log(sign(servicePayload, secret));
console.log('-------------------------------');
