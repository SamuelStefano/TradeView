'use client';

interface HistoryItem {
  t: string;
  active: boolean;
}

interface HistoryGroup {
  theme: string;
  items: HistoryItem[];
}

interface ChatSidebarProps {
  history: HistoryGroup[];
  onNewConversation: () => void;
  onSelectItem: (theme: string, index: number) => void;
}

export function ChatSidebar({ history, onNewConversation, onSelectItem }: ChatSidebarProps) {
  return (
    <aside
      aria-label="Histórico por tema"
      className="border-r border-border bg-inset flex flex-col gap-3 overflow-y-auto"
      style={{ padding: '12px' }}
    >
      <button
        onClick={onNewConversation}
        className="h-8 bg-accent-bg border border-accent-border rounded-md text-accent-hover font-semibold cursor-pointer hover:bg-accent-bg/80 transition-colors"
        style={{ fontSize: '12px' }}
      >
        + Nova conversa
      </button>
      {history.map((group) => (
        <div key={group.theme}>
          <div
            className="text-text-faint uppercase mb-1"
            style={{ fontSize: '9.5px', letterSpacing: '0.6px' }}
          >
            {group.theme}
          </div>
          {group.items.map((item, i) => (
            <button
              key={i}
              onClick={() => onSelectItem(group.theme, i)}
              className={`block w-full text-left rounded px-2 py-1.5 cursor-pointer hover:bg-hover transition-colors leading-snug ${
                item.active ? 'bg-hover text-text' : 'bg-transparent text-text-muted'
              }`}
              style={{ fontSize: '11.5px', border: 'none' }}
            >
              {item.t}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
