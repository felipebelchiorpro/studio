'use server';

import { testWebhookService } from '@/services/integrationService';

export async function testWebhookAction(url: string, eventType: 'order_created' | 'abandoned_cart') {
    // Calling the service from the server side
    return await testWebhookService(url, eventType);
}
