import { withSentryConfig } from "@sentry/nextjs";

/**
 * A static export (Sprint H phase 2): Cloudflare serves out/ as static assets and the Worker in
 * worker/ adds the per-request CSP nonce and the security headers (worker/site.ts) that
 * middleware.ts and headers() used to set, and serves /events/<id> and /runs/<id> from one
 * prebuilt shell each. No backend proxy: the dashboard reads Supabase directly. Nothing here may
 * need a server at request time.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableSourceMapUpload: true,
});
