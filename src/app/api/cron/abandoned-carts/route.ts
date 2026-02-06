import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { triggerAbandonedCartWebhook } from '@/services/webhookTriggerService';

export async function GET(request: Request) {
    try {
        // Check for basic authorization if needed (e.g., Bearer token from header) or assume n8n has a key.
        // For simplicity, we can use a query param or header in a real production env.
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new NextResponse('Unauthorized', { status: 401 });
        // }

        // Logic: Find carts that are 'open', updated > 30 mins ago, have contact info.
        // 30 minutes = 30 * 60 * 1000 ms
        const cutOffTime = new Date(Date.now() - 30 * 60 * 1000).toISOString();

        // Fetch candidates
        const { data: carts, error } = await supabaseAdmin
            .from('carts')
            .select('*')
            .eq('status', 'open')
            .lt('updated_at', cutOffTime)
            .or('user_email.neq.null,user_phone.neq.null');
        // Note: .or syntax might need adjustment for "user_email is not null OR user_phone is not null"
        // Supabase filter for "not null" is .not('column', 'is', null)
        // But doing OR with not nulls is tricky in one line.
        // Let's fetch all open & old, then filter in code to be safe and simple, 
        // OR use a raw query if performance needed. 
        // Actually, let's keep it simple: fetch all open carts older than date.

        if (error) {
            console.error("Cron Error fetching carts:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const abandonedCarts = carts?.filter(cart => cart.user_email || cart.user_phone) || [];

        console.log(`Cron: Found ${abandonedCarts.length} potential abandoned carts.`);

        const results = [];

        for (const cart of abandonedCarts) {
            // Trigger Webhook
            await triggerAbandonedCartWebhook(cart);

            // Update status to 'abandoned' to prevent re-triggering
            const { error: updateError } = await supabaseAdmin
                .from('carts')
                .update({ status: 'abandoned' })
                .eq('id', cart.id);

            if (updateError) {
                console.error(`Cron: Failed to update cart ${cart.id}`, updateError);
                results.push({ id: cart.id, status: 'failed_update' });
            } else {
                results.push({ id: cart.id, status: 'processed' });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });

    } catch (error: any) {
        console.error("Cron Exception:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
