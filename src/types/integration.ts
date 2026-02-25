
export interface IntegrationSettings {
    id: string;
    webhook_order_created: string;
    webhook_abandoned_cart: string;
    status_order_created: boolean;
    status_abandoned_cart: boolean;
    auth_token?: string;
    chatwoot_url?: string;
    chatwoot_account_id?: string;
    chatwoot_token?: string;
    chatwoot_inbox_id?: string;
    store_address?: string;
    store_hours?: string;
    created_at?: string;
    updated_at?: string;
}

export interface WebhookPayload {
    event: 'order_created' | 'abandoned_cart';
    timestamp: string;
    data: any;
}
