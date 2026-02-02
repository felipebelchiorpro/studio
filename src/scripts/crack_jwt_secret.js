const crypto = require('crypto');

// The Valid Anon Key we confirmed works in Step 1137
const VALID_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcwMDYwNTAyLCJleHAiOjIwODU0MjA1MDJ9.G7fX9K0dd1XFdbafHqPBsiKvH-Lkzlmb8hZkKfn7YJc';

const CANDIDATES = [
    'zwXD7ioa5th9whQU4R04tpYU7PIPgIon', // Lowercase g (Used initially)
    'zwXD7ioa5th9whQU4R04tpYU7PIPGIon', // Uppercase G (User provided)
    'zwXD7ioa5th9whQU4R04tpYU7PIPgIon'.trim(),
    'zwXD7ioa5th9whQU4R04tpYU7PIPGIon'.trim()
];

function verify(token, secret) {
    const [header, payload, signature] = token.split('.');
    const input = `${header}.${payload}`;
    const calculatedSig = crypto
        .createHmac('sha256', secret)
        .update(input)
        .digest('base64url');

    return calculatedSig === signature;
}

function sign(payload, secret) {
    const parts = [];
    parts.push(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64url'));
    parts.push(Buffer.from(JSON.stringify(payload)).toString('base64url'));
    const signature = crypto.createHmac('sha256', secret).update(parts.join('.')).digest('base64url');
    return parts.join('.') + '.' + signature;
}

console.log('--- TESTING SECRETS ---');
let foundSecret = null;

CANDIDATES.forEach((secret, index) => {
    if (verify(VALID_TOKEN, secret)) {
        console.log(`MATCH FOUND! Candidate #${index} is correct.`);
        console.log(`Secret: ${secret}`);
        foundSecret = secret;
    } else {
        console.log(`Candidate #${index} failed.`);
    }
});

if (foundSecret) {
    console.log('\n--- GENERATING CORRECT SERVICE KEY ---');
    const iat = Math.floor(Date.now() / 1000);
    const servicePayload = {
        role: 'service_role',
        iss: 'supabase',
        iat,
        exp: iat + (60 * 60 * 24 * 365 * 10) // 10 years
    };
    const newServiceKey = sign(servicePayload, foundSecret);
    console.log('NEW_SERVICE_KEY:');
    console.log(newServiceKey);
} else {
    console.log('\nNO MATCH FOUND. The secret is completely different.');
}
