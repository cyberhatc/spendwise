import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/budgets",
  "/savings",
  "/calendar",
  "/analytics",
  "/ai",
  "/splits",
  "/recurring",
  "/challenges",
  "/discounts",
  "/profile",
];

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const hasSupabaseEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const demoMode = !hasSupabaseEnv || process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (isAuthPath && !demoMode) {
    const cookies = request.cookies.getAll();
    const hasSession = cookies.some((c) => c.name.includes("auth-token"));
    if (hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (isProtected && !demoMode) {
    const cookies = request.cookies.getAll();
    const hasSession = cookies.some((c) => c.name.includes("auth-token"));
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
