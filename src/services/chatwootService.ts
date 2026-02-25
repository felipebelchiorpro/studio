import { Order } from '@/types';

export interface ChatwootConfig {
    url: string;
    accountId: string;
    token: string;
    inboxId: string;
}

// 1. Format phone to international
function formatPhoneForChatwoot(phone?: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');

    // If it already has 55 and length is valid
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
        return `+${cleaned}`;
    }

    // Usually brazil phones have 10 (without 9) or 11 digits (with 9)
    if (cleaned.length === 10 || cleaned.length === 11) {
        return `+55${cleaned}`;
    }

    // Default fallback
    return `+${cleaned}`;
}

// 2. Find or Create Contact in Chatwoot
async function getOrCreateContact(phone: string, name: string, config: ChatwootConfig) {
    const formattedPhone = formatPhoneForChatwoot(phone);
    if (!formattedPhone) return null;

    const headers = {
        'api_access_token': config.token,
        'Content-Type': 'application/json'
    };

    try {
        // Search first
        const searchRes = await fetch(`${config.url}/api/v1/accounts/${config.accountId}/contacts/search?q=${encodeURIComponent(formattedPhone)}`, {
            headers,
            method: 'GET'
        });

        if (searchRes.ok) {
            const data = await searchRes.json();
            if (data.payload && data.payload.length > 0) {
                return data.payload[0].id;
            }
        }

        // Create if not found
        const createRes = await fetch(`${config.url}/api/v1/accounts/${config.accountId}/contacts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                inbox_id: config.inboxId,
                name: name || 'Cliente',
                phone_number: formattedPhone
            })
        });

        if (createRes.ok) {
            const data = await createRes.json();
            return data.payload.contact.id;
        }

        console.error("Failed to create Chatwoot contact", await createRes.text());
        return null;

    } catch (e) {
        console.error("Chatwoot Contact Error:", e);
        return null;
    }
}

// 3. Create conversation and send message
async function sendChatwootMessage(contactId: number, message: string, config: ChatwootConfig) {
    const headers = {
        'api_access_token': config.token,
        'Content-Type': 'application/json'
    };

    try {
        // Create conversation
        const convRes = await fetch(`${config.url}/api/v1/accounts/${config.accountId}/conversations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                source_id: contactId,
                inbox_id: config.inboxId,
                contact_id: contactId
            })
        });

        if (!convRes.ok) {
            const err = await convRes.text();
            // It might fail if conversation already exists, we could try fetching existing active ones, 
            // but Chatwoot usually returns the existing one or allows creating a new one.
            // A more robust approach creates a new message directly if conversation creation fails due to 'already exists'
            console.error("Chatwoot conversation creation failed:", err);
            return false;
        }

        const convData = await convRes.json();
        const conversationId = convData.id;

        // Send message
        const msgRes = await fetch(`${config.url}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                content: message,
                message_type: 'outgoing'
            })
        });

        if (msgRes.ok) {
            console.log("Chatwoot message sent successfully!");
            return true;
        } else {
            console.error("Failed to send Chatwoot message:", await msgRes.text());
            return false;
        }

    } catch (e) {
        console.error("Chatwoot Send Message Error:", e);
        return false;
    }
}

export async function processChatwootNotification(order: Order, message: string, config: ChatwootConfig) {
    if (!config.url || !config.token || !config.accountId || !config.inboxId) {
        console.warn("Chatwoot configuration missing or incomplete.");
        return false;
    }

    const customerName = order.userName || order.userEmail || 'Cliente';
    const customerPhone = order.userPhone;

    if (!customerPhone) {
        console.warn(`Order ${order.id} has no phone number. Skipping Chatwoot.`);
        return false;
    }

    const contactId = await getOrCreateContact(customerPhone, customerName, config);
    if (!contactId) {
        console.error("Could not obtain Chatwoot contactId. Flow aborted.");
        return false;
    }

    return await sendChatwootMessage(contactId, message, config);
}
