import type { NewsItem } from '@/lib/data/mock/assets';
import { SourceRef } from '@/components/ui/SourceRef';
import { Bar } from '@/components/ui/Bar';

interface NewsTabProps {
  news: NewsItem[];
}

export function NewsTab({ news }: NewsTabProps) {
  return (
    <div className="py-3 flex flex-col gap-0.5">
      {news.map((n, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 py-1.5 px-1 border-b border-divider"
        >
          <span className="font-mono text-text-faint w-9 shrink-0" style={{ fontSize: '10px' }}>
            {n.ago}
          </span>
          <SourceRef
            source={n.source}
            className="text-text flex-1 min-w-0 decoration-transparent hover:text-accent-hover transition-colors"
          >
            {n.title}
          </SourceRef>
          <span className="text-text-faint shrink-0" style={{ fontSize: '10px' }}>
            {n.source}
          </span>
          <span
            className={`font-mono w-10 text-right shrink-0 ${
              n.sentimentTone === 'up'
                ? 'text-up'
                : n.sentimentTone === 'down'
                ? 'text-down'
                : 'text-text-muted'
            }`}
            style={{ fontSize: '10.5px' }}
          >
            {n.sentimentScore}
          </span>
          <Bar
            value={n.relevancePct}
            variant="accent"
            label={`relevância ${n.relevancePct}%`}
            className="w-11 shrink-0"
          />
        </div>
      ))}
    </div>
  );
}
