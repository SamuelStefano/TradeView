// Runtime-agnostic on purpose: the strategy runner is a plain Node process on
// the VPS and cannot import `server-only`. The browser guard is not lost — it
// moved to the modules under `lib/` that re-export this one, which is what a
// component would ever import by accident.

import { readFileSync } from 'node:fs';

// The `_FILE` form is how the runner reads a Docker secret. Putting the secret
// key straight into the stack file would leave it in `docker service inspect`
// and in the repository; mounted at /run/secrets it stays a file readable by the
// one container. Vercel has no such mechanism and keeps using the plain form.
function required(name: string): string {
  const path = process.env[`${name}_FILE`];
  if (path) {
    const value = readFileSync(path, 'utf8').trim();
    if (!value) throw new Error(`arquivo de segredo vazio: ${path}`);
    return value;
  }

  const value = process.env[name];
  if (!value) throw new Error(`variável de ambiente ausente: ${name}`);
  return value;
}

export function supabaseUrl(): string {
  return required('NEXT_PUBLIC_SUPABASE_URL');
}

export function supabaseSecretKey(): string {
  return required('SUPABASE_SECRET_KEY');
}

export function credentialsEncryptionKey(): Buffer {
  const key = Buffer.from(required('CREDENTIALS_ENCRYPTION_KEY'), 'base64');
  if (key.length !== 32) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY deve ter 32 bytes em base64');
  }
  return key;
}

export function realTradingAllowed(): boolean {
  return process.env.TRADEVIEW_ALLOW_REAL_TRADING === 'true';
}

export function anthropicKey(): string {
  return required('ANTHROPIC_API_KEY');
}

export function anthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
