import type { EconomicEvent, EventImpact } from '@/lib/data/mock/overview';

interface CalendarPanelProps {
  events: EconomicEvent[];
}

const impactStyle: Record<EventImpact, { bg: string; fg: string }> = {
  ALTO: { bg: '#2A1418', fg: '#F0525F' },
  MÉDIO: { bg: '#2A2113', fg: '#E8A33D' },
  BAIXO: { bg: '#151A24', fg: '#8A93A8' },
};

export function CalendarPanel({ events }: CalendarPanelProps) {
  return (
    <section
      aria-label="Calendário econômico"
      className="bg-surface border border-border rounded-lg"
      style={{ padding: '14px' }}
    >
      <div className="flex items-baseline gap-2" style={{ marginBottom: '10px' }}>
        <span
          className="text-text-muted font-medium uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          Calendário · hoje
        </span>
        <span className="font-mono text-text-faint" style={{ fontSize: '10px' }}>
          ter, 25 ago
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {events.map((event, i) => {
          const styles = impactStyle[event.impact];
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <span
                className="font-mono text-text-muted flex-shrink-0"
                style={{ fontSize: '11px', width: 38 }}
              >
                {event.time}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-text" style={{ fontSize: '12px' }}>
                  {event.title}
                </div>
                <div className="text-text-faint" style={{ fontSize: '10.5px' }}>
                  {event.forecast}
                </div>
              </div>
              <span
                className="flex-shrink-0 font-semibold"
                style={{
                  fontSize: '9.5px',
                  letterSpacing: '0.4px',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: styles.bg,
                  color: styles.fg,
                }}
              >
                {event.impact}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
