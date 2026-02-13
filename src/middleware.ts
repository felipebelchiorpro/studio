
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    const pb = new PocketBase('https://pb.darkstoresuplementos.com/');

    // load the auth store from the cookie string
    pb.authStore.loadFromCookie(request.headers.get('cookie') || '');

    try {
        // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
        if (pb.authStore.isValid) {
            try {
                // Try Admin Refresh
                await pb.admins.authRefresh();
            } catch (err) {
                // If failed, try User Refresh (in case it's a regular user logged in via dashboard?)
                // Although Dashboard is for Admins... 
                await pb.collection('users').authRefresh();
            }
        }
    } catch (_) {
        // clear the auth store on failed refresh
        pb.authStore.clear();
    }

    // send back the default 'pb_auth' cookie to the client with the latest store state
    response.headers.append('set-cookie', pb.authStore.exportToCookie({ httpOnly: false }));

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
