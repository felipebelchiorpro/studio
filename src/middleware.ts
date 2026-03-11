
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
        // We removed authRefresh to stop Next.js middleware from deleting the token locally if the network is slow or it gets mixed up.
        if (!pb.authStore.isValid) {
            pb.authStore.clear();
        }
    } catch (_) {
        // clear the auth store on failed refresh
        pb.authStore.clear();
    }

    // send back the default 'pb_auth' cookie to the client with the latest store state
    // We add maxAge to match the frontend settings and keep the session active for 7 days
    response.headers.append('set-cookie', pb.authStore.exportToCookie({ httpOnly: false, maxAge: 60 * 60 * 24 * 7 }));

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
