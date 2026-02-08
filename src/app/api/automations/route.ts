
import { NextRequest, NextResponse } from 'next/server';
import { getAutomationByEvent } from '@/actions/automations';

// GET /api/automations?event=ORDER_CONFIRMED
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const event = searchParams.get('event');

    if (!event) {
        return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }

    const automation = await getAutomationByEvent(event);

    if (!automation) {
        return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    if (!automation.is_active) {
        return NextResponse.json({
            message: 'Automation is inactive',
            is_active: false
        });
    }

    return NextResponse.json({
        event_type: automation.event_type,
        message_template: automation.message_template,
        delay_minutes: automation.delay_minutes,
        is_active: true
    });
}
