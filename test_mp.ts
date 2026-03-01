import { MercadoPagoConfig, Payment } from 'mercadopago';

async function run() {
    const token = process.env.MP_ACCESS_TOKEN || 'TEST-8292850389360812-102517-57ef9a65664ec5b3260beff535f214ee-182379528'; // Ensure we use an MP token or it will fail
    const client = new MercadoPagoConfig({ accessToken: token, options: { timeout: 5000 } });
    const payment = new Payment(client);

    try {
        const result = await payment.search({ options: { external_reference: "xmsqwddfeb70k70" } });
        console.log("Search results:", result);
    } catch (e) {
        console.error("Search failed:", e);
    }
}
run();
