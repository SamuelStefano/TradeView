// Errors safe to show the user. Anything not wrapped in this is treated as
// internal and replaced by a generic message before it reaches the browser,
// so a constraint name or query fragment never leaks through a form.
export class TradingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TradingError';
  }
}

// The order table has a unique index on (user_id, client_ref). The strategy
// runner derives that reference from the candle it decided on, so a retry after
// a lost lease collides here instead of buying the same signal a second time.
// For the runner that collision is the guarantee working, not a failure, which
// is why it needs to be told apart from every other database error.
export class DuplicateOrderError extends TradingError {
  constructor() {
    super('ordem desta vela já foi registrada');
    this.name = 'DuplicateOrderError';
  }
}

interface PostgrestLikeError {
  code?: string;
  message: string;
}

// A bare `raise exception` in PL/pgSQL surfaces as P0001. Every message our own
// functions produce arrives with that code and is written for the user; any
// other code came from Postgres itself and describes the schema.
export function fromDatabase(error: PostgrestLikeError, context: string): Error {
  if (error.code === '23505') return new DuplicateOrderError();
  if (error.code === 'P0001') return new TradingError(error.message);

  console.error(`[${context}]`, error.code, error.message);
  return new TradingError('não foi possível concluir a operação');
}
