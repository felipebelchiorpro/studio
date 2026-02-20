
import PocketBase from 'pocketbase';
import { createClient } from '@supabase/supabase-js';

async function checkConfigs() {
    // 1. Check PocketBase store_settings
    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');
    await pb.admins.authWithPassword('contatofelipebelchior@gmail.com', '12345678');

    // 1. Check PocketBase integration_settings
    try {
        const integrationSettings = await pb.collection('integration_settings').getFullList();
        console.log("PocketBase Integration Settings (Deep Dump):", JSON.stringify(integrationSettings, null, 2));
    } catch (e) {
        console.log("Error fetching PB integration_settings");
    }

    // 2. Check PocketBase store_settings
    try {
        const storeSettings = await pb.collection('store_settings').getFullList();
        console.log("PocketBase Store Settings (Deep Dump):", JSON.stringify(storeSettings, null, 2));
    } catch (e) {
        console.log("Error fetching PB store_settings");
    }
}

checkConfigs();
