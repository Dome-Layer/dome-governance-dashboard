import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Nonce-based CSP. No 'unsafe-eval' (no Mermaid in P6).
// 'wasm-unsafe-eval' is required for @react-pdf/renderer — it compiles a WASM
// font-subsetting module at runtime. This keyword is distinct from 'unsafe-eval'
// and only permits WebAssembly compilation, not arbitrary eval/Function().
// Supabase direct-read URLs are allowed via *.supabase.co in connect-src.
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co https://*.ingest.de.sentry.io",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico|favicon.svg|favicon.png|apple-touch-icon.png).*)",
  ],
};
