
import PocketBase from 'pocketbase';

async function listCollections() {
    const url = 'https://pb.darkstoresuplementos.com/';
    const email = 'contatofelipebelchior@gmail.com';
    const password = '12345678';

    if (!email || !password) {
        console.error("Credentials missing");
        return;
    }

    const pb = new PocketBase(url);
    await pb.admins.authWithPassword(email, password);

    const collections = await pb.collections.getFullList();
    console.log("Collections:", collections.map(c => c.name));

    // If whatsapp_automations exists, dump it
    const wa = collections.find(c => c.name === 'whatsapp_automations');
    if (wa) {
        const records = await pb.collection('whatsapp_automations').getFullList();
        console.log("WhatsApp Automations Records:", JSON.stringify(records, null, 2));
    }
}

listCollections();
