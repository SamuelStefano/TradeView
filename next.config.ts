import type { NextConfig } from 'next';

// Pinned to this project's own origin. A wildcard over *.supabase.co would let
// injected script post the session to any Supabase project an attacker can
// create for free, with the CSP approving the exfiltration.
function supabaseOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return 'https://*.supabase.co wss://*.supabase.co';

  try {
    const { host } = new URL(raw);
    return `https://${host} wss://${host}`;
  } catch {
    return 'https://*.supabase.co wss://*.supabase.co';
  }
}

const CSP = [
  "default-src 'self'",
  // Next injects an inline bootstrap script on every page; dropping
  // 'unsafe-inline' here requires nonce plumbing through the proxy first.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin()}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  // ccxt is a large CommonJS package that reaches for Node built-ins. Bundling
  // it breaks it, so keep it as a plain runtime require.
  serverExternalPackages: ['ccxt'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
