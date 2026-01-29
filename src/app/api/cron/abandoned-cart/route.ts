import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { triggerAbandonedCartWebhook } from '@/services/webhookTriggerService';

// This route should be called periodically (e.g., every 10-30 mins)
export async function GET(request: Request) {
    // Optional: secure this route with a secret key in params
    // const { searchParams } = new URL(request.url);
    // if (searchParams.get('key') !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    console.log('Cron: Checking for abandoned carts...');

    // 1. Define timeout (1 hour ago)
    const timeoutThreshold = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // 2. Query carts that are 'open', haven't been updated in 1h, and have an email
    const { data: carts, error } = await supabaseAdmin
        .from('carts')
        .select('*')
        .eq('status', 'open')
        .lt('updated_at', timeoutThreshold)
        .neq('user_email', null); // Only abandon if we have a way to contact

    if (error) {
        console.error('Cron: Error fetching carts', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!carts || carts.length === 0) {
        return NextResponse.json({ message: 'No abandoned carts found.' });
    }

    console.log(`Cron: Found ${carts.length} potential abandoned carts.`);

    let triggeredCount = 0;

    // 3. Process each cart
    for (const cart of carts) {
        // Double check: ensure items is not empty
        if (Array.isArray(cart.items) && cart.items.length > 0) {

            // Trigger Webhook
            await triggerAbandonedCartWebhook(cart);

            // Mark as 'abandoned' so we don't trigger again
            await supabaseAdmin
                .from('carts')
                .update({ status: 'abandoned', updated_at: new Date().toISOString() })
                .eq('id', cart.id);

            triggeredCount++;
        } else {
            // Empty cart, just close it
            await supabaseAdmin.from('carts').update({ status: 'closed' }).eq('id', cart.id);
        }
    }

    return NextResponse.json({
        success: true,
        processed: carts.length,
        triggered: triggeredCount
    });
}
