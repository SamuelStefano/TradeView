'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';

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

  function select(id: string) {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  }

  return (
    <div className={className}>
      <div role="tablist" className="flex border-b border-border">
        {items.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`${groupId}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`${groupId}-panel-${tab.id}`}
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
