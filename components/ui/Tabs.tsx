'use client';

import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ items, defaultTab, value, onChange, className = '' }: TabsProps) {
  const groupId = useId();
  const [internal, setInternal] = useState(defaultTab ?? items[0]?.id);
  const active = value ?? internal;
  const current = items.find((tab) => tab.id === active) ?? items[0];
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function select(id: string) {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };
    const index = items.findIndex((tab) => tab.id === active);
    let next = -1;

    if (event.key in offsets) {
      next = (index + offsets[event.key] + items.length) % items.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = items.length - 1;
    }
    if (next === -1) return;

    event.preventDefault();
    const target = items[next];
    select(target.id);
    tabRefs.current[target.id]?.focus();
  }

  return (
    <div className={className}>
      <div role="tablist" onKeyDown={handleKeyDown} className="flex border-b border-border">
        {items.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              id={`${groupId}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`${groupId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(tab.id)}
              className={`-mb-px cursor-pointer border-b-2 px-3 py-2 font-sans text-xs font-medium transition-colors ${
                isActive
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {current && (
        <div
          id={`${groupId}-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`${groupId}-tab-${current.id}`}
        >
          {current.content}
        </div>
      )}
    </div>
  );
}
