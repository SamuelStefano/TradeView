import { getDataSource } from '@/lib/data/index';
import { AlertList } from '@/components/alerts/AlertList';
import { FiredHistory } from '@/components/alerts/FiredHistory';
import { CreateAlertPanel } from '@/components/alerts/CreateAlertPanel';

export const metadata = {
  title: 'Alertas — TradeView',
};

export default async function AlertsPage() {
  const data = await getDataSource().getAlerts();

  return (
    <div
      className="p-4 grid gap-3"
      style={{ gridTemplateColumns: '1fr 360px', fontSize: '13px', alignItems: 'start' }}
    >
      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-text m-0" style={{ fontSize: '16px', fontWeight: 700 }}>
            Alertas &amp; sinais
          </h1>
          <span className="text-text-muted" style={{ fontSize: '11px' }}>
            {data.total} ativos · {data.firedToday} disparados hoje
          </span>
        </div>

        <AlertList alerts={data.alerts} />
        <FiredHistory fired={data.fired} />
      </div>

      <CreateAlertPanel />
    </div>
  );
}
