// Reading a secret through this module throws on the client, so a stray import
// from a component fails the build instead of inlining the value into the
// browser bundle. The reads themselves live in ./core/env so the runner, which
// has no React runtime, can use the same ones.
import 'server-only';

export {
  supabaseUrl,
  supabaseSecretKey,
  credentialsEncryptionKey,
  realTradingAllowed,
  anthropicKey,
  anthropicConfigured,
} from './core/env';
