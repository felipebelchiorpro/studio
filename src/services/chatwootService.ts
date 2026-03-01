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

    // Bradeaux phones (+55): if doesn't start with 55
    if (!cleaned.startsWith('55')) {
        // Assume brazil if 10 or 11 digits
        if (cleaned.length === 10 || cleaned.length === 11) {
            cleaned = `55${cleaned}`;
        }
    }

    return `+${cleaned}`;
}

function getBaseUrl(url: string): string {
    return url.replace(/\/$/, ""); // Remove trailing slash
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
        const baseUrl = getBaseUrl(config.url);
        console.log(`[Chatwoot] Searching for contact: ${formattedPhone}`);

        // Search first
        const searchRes = await fetch(`${baseUrl}/api/v1/accounts/${config.accountId}/contacts/search?q=${encodeURIComponent(formattedPhone)}`, {
            headers,
            method: 'GET'
        });

        if (searchRes.ok) {
            const data = await searchRes.json();
            if (data.payload && data.payload.length > 0) {
                console.log(`[Chatwoot] Found existing contact: ${data.payload[0].id}`);
                return data.payload[0].id;
            }
        } else {
            console.error(`[Chatwoot] Contact search failed: ${searchRes.status} ${await searchRes.text()}`);
        }

        // Create if not found
        console.log(`[Chatwoot] Creating new contact: ${name}`);
        const createRes = await fetch(`${baseUrl}/api/v1/accounts/${config.accountId}/contacts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                inbox_id: Number(config.inboxId),
                name: name || 'Cliente',
                phone_number: formattedPhone
            })
        });

        if (createRes.ok) {
            const data = await createRes.json();
            console.log(`[Chatwoot] Contact created: ${data.payload.contact.id}`);
            return data.payload.contact.id;
        }

        console.error(`[Chatwoot] Failed to create Chatwoot contact: ${createRes.status} ${await createRes.text()}`);
        return null;

    } catch (e) {
        console.error("[Chatwoot] Contact exception:", e);
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
        const baseUrl = getBaseUrl(config.url);

        // Check for existing conversation for this contact
        const searchConvRes = await fetch(`${baseUrl}/api/v1/accounts/${config.accountId}/contacts/${contactId}/conversations`, {
            headers,
            method: 'GET'
        });

        if (searchConvRes.ok) {
            const convData = await searchConvRes.json();
            if (convData.payload && convData.payload.length > 0) {
                const active = convData.payload.find((c: any) => c.status !== 'resolved');
                if (active) {
                    console.log(`[Chatwoot] Found existing active conversation: ${active.id}`);
                    return active.id;
                }
            }
        }

        console.log(`[Chatwoot] Creating new conversation for contact ${contactId}`);
        const convRes = await fetch(`${baseUrl}/api/v1/accounts/${config.accountId}/conversations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                inbox_id: Number(config.inboxId),
                contact_id: Number(contactId)
            })
        });

        if (!convRes.ok) {
            const errText = await convRes.text();
            console.error(`[Chatwoot] Conversation creation failed: ${convRes.status} ${errText}`);
            return null;
        }

        const convData = await convRes.json();
        console.log(`[Chatwoot] Conversation created: ${convData.id}`);
        return convData.id;
    } catch (e) {
        console.error("[Chatwoot] Conversation exception:", e);
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
        const baseUrl = getBaseUrl(config.url);
        const msgRes = await fetch(`${baseUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                content: message,
                message_type: 'outgoing'
            })
        });

        if (msgRes.ok) {
            console.log(`[Chatwoot] Message sent successfully to conversation ${conversationId}`);
            return true;
        } else {
            console.error(`[Chatwoot] Failed to send message: ${msgRes.status} ${await msgRes.text()}`);
            return false;
        }
    } catch (e) {
        console.error("[Chatwoot] Send message exception:", e);
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
        const baseUrl = getBaseUrl(config.url);
        await fetch(`${baseUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/typing_status`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                typing_status: 'on'
            })
        });
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
