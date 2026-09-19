// This Supabase project is shared with another app, so an open signup form would
// let anyone who finds the URL create rows next to that app's data. Access is
// closed by default and opens only for addresses named explicitly, because
// forgetting to set the variable has to fail shut rather than wide open.
//
// It gates sign-IN as much as sign-up: auth.users is project-wide, so every
// account of the neighbouring app already holds valid credentials here. Checking
// only at signup would let all of them in through the login form.
export function accessAllowed(email: string): boolean {
  const allowed = (process.env.TRADEVIEW_SIGNUP_ALLOWLIST ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.trim().toLowerCase());
}
