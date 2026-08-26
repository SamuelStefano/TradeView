import Anthropic from '@anthropic-ai/sdk';

import { anthropicConfigured, anthropicKey } from '@/lib/env';
import { getSessionUserId } from '@/lib/supabase/server';
import { supabaseConfigured } from '@/lib/supabase/config';
import { checkRate } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODELS = ['claude-sonnet-4-6', 'claude-opus-4-7', 'claude-haiku-4-5-20251001'] as const;
type Model = (typeof MODELS)[number];

const MAX_MESSAGES = 40;
const MAX_CHARS = 8000;

const SYSTEM = `Você é o Analyst do TradeView, um terminal de trading multimercado.
Responde em português do Brasil, direto, sem preâmbulo.

Regra inviolável: você não tem acesso a cotações ao vivo, ao portfólio do usuário
nem a notícias. Nunca invente um preço, um percentual, um ticker ou uma manchete.
Se a resposta depende de um número que não te foi dado nesta conversa, diga que
precisa do dado e explique qual. Raciocínio sobre mecanismo, risco e estratégia
você pode dar à vontade.

Nada do que você escreve é recomendação de investimento.`;

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

function parseMessages(raw: unknown): IncomingMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('conversa vazia');
  if (raw.length > MAX_MESSAGES) throw new Error('conversa longa demais');

  return raw.map((entry) => {
    const item = entry as Record<string, unknown>;
    if (item.role !== 'user' && item.role !== 'assistant') throw new Error('papel inválido');
    if (typeof item.content !== 'string' || item.content.trim() === '') {
      throw new Error('mensagem vazia');
    }
    if (item.content.length > MAX_CHARS) throw new Error('mensagem longa demais');
    return { role: item.role, content: item.content };
  });
}

function parseModel(raw: unknown): Model {
  return MODELS.includes(raw as Model) ? (raw as Model) : 'claude-sonnet-4-6';
}

function refuse(message: string, status: number): Response {
  return new Response(message, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

export async function POST(request: Request): Promise<Response> {
  // The key is Samuel's and every call costs money, so an unauthenticated
  // request must never reach Anthropic. With no database there is no way to
  // establish who is asking, and the route stays shut rather than open.
  if (!supabaseConfigured) return refuse('chat requer banco configurado', 503);
  if (!anthropicConfigured()) return refuse('ANTHROPIC_API_KEY não configurada', 503);

  const userId = await getSessionUserId();
  if (!userId) return refuse('sessão expirada — entre novamente', 401);

  let messages: IncomingMessage[];
  let model: Model;
  try {
    checkRate(`chat:${userId}`);
    const body = (await request.json()) as Record<string, unknown>;
    messages = parseMessages(body.messages);
    model = parseModel(body.model);
  } catch (error) {
    return refuse(error instanceof Error ? error.message : 'requisição inválida', 400);
  }

  const client = new Anthropic({ apiKey: anthropicKey() });

  const stream = client.messages.stream({
    model,
    max_tokens: 2048,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages,
  });

  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (error) {
          console.error('[chat]', error);
          controller.enqueue(encoder.encode('\n\n[a resposta foi interrompida]'));
        } finally {
          controller.close();
        }
      },
      cancel() {
        stream.abort();
      },
    }),
    {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-accel-buffering': 'no',
      },
    },
  );
}
