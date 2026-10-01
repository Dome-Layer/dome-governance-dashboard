/**
 * What is specific to the Governance Dashboard. The rest of worker/ is the shared tool Worker
 * (dome-docs/templates/tool-worker, Sprint H phase 2), copied unchanged into each tool.
 */

/**
 * The Content-Security-Policy. index.ts puts the per-response nonce in place of {NONCE}.
 * Copied from the middleware it replaces (2026-10-01), which is what production sent.
 * 'wasm-unsafe-eval' is kept on purpose (WebAssembly in the export and chart code).
 */
export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{NONCE}' 'strict-dynamic' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://*.supabase.co https://*.ingest.de.sentry.io",
  "font-src 'self'",
  "frame-ancestors 'none'",
]

/** Headers on every response (they were in next.config headers()). */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

/**
 * Dynamic routes, served from one prebuilt page each: /events/<event id> gets /events/_ and
 * /runs/<workflow run id> gets /runs/_ (with their client-navigation payloads); the pages read the
 * id from the URL (lib/routeId.ts).
 */
export const SHELL_ROUTES: { prefix: string; shell: string }[] = [
  { prefix: '/events/', shell: '/events/_' },
  { prefix: '/runs/', shell: '/runs/_' },
]

/** Paths passed through to a backend. None: the dashboard reads Supabase directly. */
export const PROXY_PREFIXES: string[] = []
