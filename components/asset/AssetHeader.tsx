import Link from 'next/link';
import type { Tone } from '@/lib/types';
import type { AssetDetailData } from '@/lib/data/views/assets';
import { toneClass } from '@/lib/format';
import { FreshnessTag } from '@/components/ui/FreshnessTag';

interface AssetHeaderProps {
  asset: AssetDetailData['asset'];
  tone: Tone;
}

export function AssetHeader({ asset, tone }: AssetHeaderProps) {
  return (
    <div className="flex items-center gap-4 bg-surface border border-border rounded-lg px-3.5 py-2.5">
      <div>
        <div className="flex items-baseline gap-2">
          <h1 className="m-0 font-mono font-bold" style={{ fontSize: '16px' }}>
            {asset.symbol}
          </h1>
          <span className="text-text-faint" style={{ fontSize: '11px' }}>
            {asset.venue}
          </span>
        </div>
        <div className="text-text-muted" style={{ fontSize: '11px' }}>
          {asset.name}
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono tabular-nums font-semibold" style={{ fontSize: '20px' }}>
          {asset.price}
        </div>
        <div
          className={`font-mono tabular-nums ${toneClass(tone)}`}
          style={{ fontSize: '12px' }}
        >
          {asset.change}
        </div>
      </div>
      <div
        className="flex gap-3.5 ml-2 pl-4"
        style={{ borderLeft: '1px solid var(--color-border)' }}
      >
        {asset.stats.map((st) => (
          <div key={st.key}>
            <div
              className="text-text-faint"
              style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}
            >
              {st.key}
            </div>
            <div className="font-mono tabular-nums text-right" style={{ fontSize: '12px' }}>
              {st.value}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1" />
      <FreshnessTag
        freshness={asset.freshness}
        className="border border-border-strong rounded px-1.5 py-0.5"
      />
      <Link
        href="/alerts"
        className="cursor-pointer hover:border-border-hover transition-colors flex items-center no-underline"
        style={{
          height: '30px',
          padding: '0 14px',
          background: 'var(--color-hover)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: '6px',
          color: 'var(--color-text-secondary)',
          fontSize: '12px',
          fontFamily: 'inherit',
        }}
      >
        + Alerta
      </Link>
      <Link
        href={`/trade?symbol=${encodeURIComponent(asset.symbol)}`}
        className="cursor-pointer flex items-center no-underline"
        style={{
          height: '30px',
          padding: '0 14px',
          background: 'var(--color-accent-bg)',
          border: '1px solid var(--color-accent-border)',
          borderRadius: '6px',
          color: 'var(--color-accent-hover)',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: 'inherit',
        }}
      >
        Operar na mesa
      </Link>
    </div>
  );
}
