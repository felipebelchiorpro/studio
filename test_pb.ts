import { pb } from './src/lib/pocketbase';

async function run() {
    try {
        const rates = await pb.collection('shipping_rates').getFullList();
        console.log("Rates: ", rates);

        const user = await pb.collection('users').getFirstListItem('');
        console.log("User sample: ", user);
    } catch (e) {
        console.error(e);
    }
}
run();
