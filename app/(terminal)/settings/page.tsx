import { ApiKeysSection } from '@/components/settings/ApiKeysSection';
import { RiskSection } from '@/components/settings/RiskSection';
import { PrefsSection } from '@/components/settings/PrefsSection';

export const metadata = {
  title: 'Configurações — TradeView',
};

export default function SettingsPage() {
  return (
    <div
      className="p-4"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        fontSize: 13,
        alignItems: 'start',
        maxWidth: 1100,
      }}
    >
      <h1
        className="text-text font-bold"
        style={{ margin: 0, fontSize: 16, gridColumn: '1 / -1' }}
      >
        Configurações
      </h1>
      <ApiKeysSection />
      <RiskSection />
      <PrefsSection />
    </div>
  );
}
