'use client';

import type { CSSProperties } from 'react';

interface ExportCsvButtonProps {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

// Planilhas interpretam celula iniciada por = + - @ como formula.
function csvCell(value: string | number): string {
  const raw = String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function ExportCsvButton({
  headers,
  rows,
  filename,
  label = 'Exportar CSV',
  className = '',
  style,
}: ExportCsvButtonProps) {
  function exportCsv() {
    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={rows.length === 0}
      className={`bg-hover border border-border-strong rounded text-text-secondary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={style}
    >
      {label}
    </button>
  );
}
