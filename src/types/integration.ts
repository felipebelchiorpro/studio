
export interface IntegrationSettings {
    id: string;
    webhook_order_created: string;
    webhook_abandoned_cart: string;
    status_order_created: boolean;
    status_abandoned_cart: boolean;
    auth_token?: string;
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
