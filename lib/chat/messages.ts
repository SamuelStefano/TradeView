export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const MAX_MESSAGES = 40;
export const MAX_CHARS = 8_000;

// The per-message cap alone let a full conversation reach 320k characters —
// roughly 80k tokens — and the whole history is re-sent on every turn, so the
// cost grows quadratically with the thread. This is the ceiling that actually
// bounds the bill.
export const MAX_TOTAL_CHARS = 48_000;

export function parseMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('conversa vazia');
  if (raw.length > MAX_MESSAGES) throw new Error('conversa longa demais');

  let total = 0;

  const messages = raw.map((entry): ChatMessage => {
    const item = entry as Record<string, unknown>;
    if (item.role !== 'user' && item.role !== 'assistant') throw new Error('papel inválido');
    if (typeof item.content !== 'string' || item.content.trim() === '') {
      throw new Error('mensagem vazia');
    }
    if (item.content.length > MAX_CHARS) throw new Error('mensagem longa demais');

    total += item.content.length;
    return { role: item.role, content: item.content };
  });

  if (total > MAX_TOTAL_CHARS) {
    throw new Error('conversa longa demais — comece uma nova para continuar');
  }

  return messages;
}
