'use client';

import { useRef } from 'react';
import type { KeyboardEvent } from 'react';

const OFFSETS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowUp: -1,
  ArrowRight: 1,
  ArrowDown: 1,
};

export function useRadioGroup<T extends string>(
  options: readonly T[],
  value: T,
  onChange: (next: T) => void,
) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const step = OFFSETS[event.key];
    if (step === undefined) return;

    event.preventDefault();
    const next = options[(options.indexOf(value) + step + options.length) % options.length];
    onChange(next);
    refs.current[next]?.focus();
  }

  function itemProps(option: T) {
    return {
      ref: (el: HTMLButtonElement | null) => {
        refs.current[option] = el;
      },
      type: 'button' as const,
      role: 'radio' as const,
      'aria-checked': option === value,
      tabIndex: option === value ? 0 : -1,
      onClick: () => onChange(option),
    };
  }

  return { groupProps: { onKeyDown }, itemProps };
}
