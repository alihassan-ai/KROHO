import { NextRequest, NextResponse } from "next/server";

// Lightweight proxy: checks for the JWT session cookie only.
// Does NOT import Prisma or auth — safe for edge runtime.
export function proxy(request: NextRequest) {
    const sessionToken =
        request.cookies.get("authjs.session-token")?.value ||
        request.cookies.get("__Secure-authjs.session-token")?.value;

    const { pathname } = request.nextUrl;

    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup");

    const isPublicPage = pathname === "/" || pathname.startsWith("/public");

    // Authenticated user on auth page → redirect to dashboard
    if (isAuthPage && sessionToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Authenticated user on root landing page → redirect to dashboard
    if (pathname === "/" && sessionToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Unauthenticated user on protected page → redirect to login
    if (!isAuthPage && !isPublicPage && !sessionToken) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
