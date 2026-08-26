'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ChatHeader, type Model } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { UserMessage } from '@/components/chat/UserMessage';
import { AssistantMessage } from '@/components/chat/AssistantMessage';
import { FailureBanner } from '@/components/chat/FailureBanner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BOTTOM_SLACK_PX = 80;

export default function ChatPage() {
  const [model, setModel] = useState<Model>('claude-sonnet-4-6');
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Following the tail is a mode the reader enters and leaves by scrolling, not
  // something the stream imposes. Without it, every chunk yanks the viewport
  // back down and reading anything above the fold becomes impossible.
  const followRef = useRef(true);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    followRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_SLACK_PX;
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (el && followRef.current) el.scrollTop = el.scrollHeight;
  });

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string, history: Message[]) => {
      const outgoing = [...history, { role: 'user' as const, content: text }];
      setMessages([...outgoing, { role: 'assistant', content: '' }]);
      setError('');
      setStreaming(true);
      followRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: outgoing, model }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          setMessages(outgoing);
          setError((await response.text()) || 'não foi possível falar com o modelo');
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages([...outgoing, { role: 'assistant', content: acc }]);
        }
      } catch (cause) {
        if ((cause as Error).name === 'AbortError') return;
        setMessages(outgoing);
        setError('a conexão caiu antes da resposta terminar');
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [model],
  );

  function handleSend() {
    const text = draft.trim();
    if (!text || streaming) return;
    void send(text, messages);
  }

  function handleRetry() {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    const upTo = messages.slice(0, messages.lastIndexOf(lastUser));
    void send(lastUser.content, upTo);
  }

  function handleNewConversation() {
    abortRef.current?.abort();
    setMessages([]);
    setError('');
    setDraft('');
  }

  return (
    <div className="flex flex-col min-w-0" style={{ height: 'calc(100vh - 66px)', fontSize: '13px' }}>
      <h1 className="sr-only">Chat com a IA Analyst</h1>

      <ChatHeader
        model={model}
        onModelChange={setModel}
        onNewConversation={handleNewConversation}
        canReset={messages.length > 0}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto flex flex-col gap-4"
        style={{ padding: '18px 22px' }}
        aria-live="polite"
        aria-label="Conversa com a IA Analyst"
      >
        {messages.length === 0 && !error && (
          <p className="text-text-faint m-0 self-center" style={{ maxWidth: '52ch', marginTop: '18vh', textAlign: 'center', lineHeight: 1.6 }}>
            Pergunte sobre mecanismo de mercado, risco ou estratégia. O Analyst não
            enxerga cotação ao vivo nem o seu portfólio — traga os números na pergunta
            e ele raciocina em cima deles.
          </p>
        )}

        {messages.map((message, i) =>
          message.role === 'user' ? (
            <UserMessage key={i} text={message.content} />
          ) : (
            <AssistantMessage
              key={i}
              model={model}
              text={message.content}
              pending={streaming && i === messages.length - 1}
            />
          ),
        )}

        {error && <FailureBanner message={error} onRetry={handleRetry} />}
      </div>

      <ChatInput value={draft} onChange={setDraft} onSend={handleSend} disabled={streaming} />
    </div>
  );
}
