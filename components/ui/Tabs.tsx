'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);

  const current = items.find((t) => t.id === active) ?? items[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex border-b border-border"
      >
        {items.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer font-sans ${
                isActive
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
              style={{ marginBottom: '-1px' }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">
        {current?.content}
      </div>
    </div>
  );
}
