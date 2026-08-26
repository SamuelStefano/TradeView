const FALLBACK = '/trade';

// The post-login destination arrives from a query string, so it is attacker
// controlled: anything that could resolve to another origin has to be rejected
// rather than sanitised. A protocol-relative "//evil.com" is the case a naive
// startsWith('/') check lets through.
export function safeNextPath(raw: string | undefined): string {
  if (!raw) return FALLBACK;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return FALLBACK;
  return raw;
}
