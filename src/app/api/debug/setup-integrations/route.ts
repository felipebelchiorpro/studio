import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
    try {
        console.log("Debug: Checking integration_settings...");
        const { data, error } = await supabaseAdmin.from('integration_settings').select('*');

        if (error) {
            console.error("Debug Error:", error);
            return NextResponse.json({
                success: false,
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
        }

        return NextResponse.json({
            success: true,
            count: data.length,
            rows: data
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
