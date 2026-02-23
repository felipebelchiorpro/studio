import { fetchOrdersService } from './src/services/orderService';

async function main() {
    console.log("Fetching orders using service...");
    try {
        const orders = await fetchOrdersService();
        console.log("Orders count:", orders.length);
        if (orders.length > 0) {
            console.log("First order:", JSON.stringify(orders[0], null, 2));
        }
    } catch (err) {
        console.error("Error calling fetchOrdersService:", err);
    }
}

main();
