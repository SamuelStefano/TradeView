import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';
import { credentialsEncryptionKey } from '../env';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

// Exchange keys are encrypted in the application, not in Postgres, so a stolen
// database dump yields ciphertext and nothing else.
export function seal(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, credentialsEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((b) => b.toString('base64')).join('.');
}

export function open(sealed: string): string {
  const parts = sealed.split('.');
  if (parts.length !== 3) throw new Error('ciphertext malformado');

  const [iv, tag, ciphertext] = parts.map((p) => Buffer.from(p, 'base64'));
  const decipher = createDecipheriv(ALGORITHM, credentialsEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

export function lastFour(secret: string): string {
  return secret.slice(-4).padStart(4, '•');
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
