import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content-Security-Policy is set per-request in middleware.ts (nonce-based).
        ],
      },
    ];
  },
  // No backend proxy — governance dashboard reads Supabase directly.
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableSourceMapUpload: true,
});
