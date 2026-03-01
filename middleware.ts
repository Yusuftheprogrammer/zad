/**
 * Middleware: protect /dashboard and redirect unauthenticated users to /login.
 * Role-based redirects (student/teacher) happen on the dashboard page.
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.JWT_SECRET,
  });

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isLogin = request.nextUrl.pathname === "/login";
  const isSignUp = request.nextUrl.pathname === "/signup";

  // Always allow login/signup.
  // We do redirects in server components after DB-backed auth checks.
  if (isLogin || isSignUp) return NextResponse.next();

  // Protect dashboard: require auth
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
