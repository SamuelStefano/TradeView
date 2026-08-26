// This Supabase project is shared with another app, so an open signup form would
// let anyone who finds the URL create rows next to that app's data. Signup is
// closed by default and opens only for addresses named explicitly, because
// forgetting to set the variable has to fail shut rather than wide open.
export function signupAllowed(email: string): boolean {
  const allowed = (process.env.TRADEVIEW_SIGNUP_ALLOWLIST ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.trim().toLowerCase());
}
