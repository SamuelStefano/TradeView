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
        <AlertList alerts={data.alerts} firedToday={data.firedToday} />
        <FiredHistory fired={data.fired} />
      </div>

      <CreateAlertPanel />
    </div>
  );
}
