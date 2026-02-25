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

// 3. Create or Get Conversation
async function getOrCreateConversation(contactId: number, config: ChatwootConfig) {
    const headers = {
        'api_access_token': config.token,
        'Content-Type': 'application/json'
    };

    try {
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
            console.error("Chatwoot conversation creation failed:", await convRes.text());
            return null;
        }

        const convData = await convRes.json();
        return convData.id;
    } catch (e) {
        console.error("Chatwoot Conversation Error:", e);
        return null;
    }
}

// 4. Send Message to Conversation
async function sendMessageToConversation(conversationId: number, message: string, config: ChatwootConfig) {
    const headers = {
        'api_access_token': config.token,
        'Content-Type': 'application/json'
    };

    try {
        const msgRes = await fetch(`${config.url}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                content: message,
                message_type: 'outgoing'
            })
        });

        if (msgRes.ok) {
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

// 5. Typing indicator (Optional)
async function sendTypingIndicator(conversationId: number, config: ChatwootConfig) {
    const headers = {
        'api_access_token': config.token,
        'Content-Type': 'application/json'
    };

    try {
        // endpoint could be /api/v1/accounts/{account_id}/conversations/{conversation_id}/typing_status or /events
        // Some Chatwoot versions support this hidden endpoint/event trigger
        await fetch(`${config.url}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/typing_status`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                typing_status: 'on'
            })
        });
        // We don't check for failure because it is optional
    } catch (e) {
        // fail silently
    }
}

// Helper: Delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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

    const conversationId = await getOrCreateConversation(contactId, config);
    if (!conversationId) {
        console.error("Could not obtain Chatwoot conversationId. Flow aborted.");
        return false;
    }

    // --- HUMANIZATION LOGIC ---

    // 1. Random Greeting
    const names = customerName.split(' ');
    const firstName = names[0] !== 'Cliente' && names[0].length > 1 ? names[0] : '';

    let greetings = [
        "Oi, tudo bem?",
        "Olá, como vai?",
        "Ei!"
    ];

    if (firstName) {
        greetings = [
            `Oi ${firstName}, tudo bem?`,
            `Olá ${firstName}, como vai?`,
            `Ei ${firstName}!`
        ];
    }

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Send Greeting
    const greetingSent = await sendMessageToConversation(conversationId, randomGreeting, config);
    if (!greetingSent) return false;

    // 2. Typing Indicator & Delay (8s to 15s)
    const delayTime = Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000;

    // Fire typing indicator
    await sendTypingIndicator(conversationId, config);

    // Wait
    await delay(delayTime);

    // 3. Send Main Message
    const mainMsgSent = await sendMessageToConversation(conversationId, message, config);

    if (mainMsgSent) {
        console.log(`[Chatwoot] Successfully sent humanized sequence for order ${order.id}`);
        return true;
    }

    return false;
}
