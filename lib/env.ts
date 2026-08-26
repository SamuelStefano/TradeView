import 'server-only';

// Reading a secret through this module throws on the client, so a stray import
// from a component fails the build instead of inlining the value into the
// browser bundle.
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`variável de ambiente ausente: ${name}`);
  return value;
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
