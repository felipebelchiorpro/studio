// User Service Key (from Step 1341)
const VALID_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzAwNjMwNTUsImV4cCI6MjA4NTQyMzA1NX0.lITdrr5jN79Fhvuqn3eoXPd2kcHL-LWyduHa6cFGyNk';

function decode(token) {
    const [header, payload, signature] = token.split('.');

    console.log('--- HEADER ---');
    console.log(Buffer.from(header, 'base64url').toString());

    console.log('\n--- PAYLOAD ---');
    console.log(Buffer.from(payload, 'base64url').toString());
}

decode(VALID_TOKEN);
