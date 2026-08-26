import Link from 'next/link';
import { redirect } from 'next/navigation';

import { supabaseConfigured } from '@/lib/supabase/config';
import { getSessionUserId } from '@/lib/supabase/server';
import { readRiskSettings } from '@/lib/trading/risk-settings';
import { realTradingAllowed } from '@/lib/env';
import { RiskLimitsForm } from '@/components/settings/RiskLimitsForm';
import { CredentialsSection } from '@/components/settings/CredentialsSection';

export const metadata = { title: 'Configurações — TradeView' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  if (!supabaseConfigured) {
    return (
      <div className="p-5 flex flex-col gap-2">
        <h1 className="text-sm font-bold text-text m-0">
          Configurações indisponíveis em modo demonstração
        </h1>
        <p className="text-[11.5px] text-text-secondary max-w-[560px] m-0">
          Os limites de risco moram no banco. Configure as variáveis do Supabase para habilitar.
        </p>
      </div>
    );
  }

  const userId = await getSessionUserId();
  if (!userId) redirect('/login');

  const settings = await readRiskSettings(userId);

  return (
    <div className="p-4 flex flex-col gap-3" style={{ fontSize: 13, maxWidth: 780 }}>
      <h1 className="text-text font-bold m-0" style={{ fontSize: 16 }}>
        Configurações
      </h1>

      {settings.killSwitchActive && (
        <p
          className="bg-down-bg border border-danger-border rounded-md text-down m-0"
          style={{ fontSize: 11.5, padding: '8px 12px' }}
          role="status"
        >
          Kill switch ativo — ordens e transferências estão bloqueadas. Desligue pela barra
          superior.
        </p>
      )}

      <RiskLimitsForm
        maxOrderNotional={settings.maxOrderNotional}
        realTradingEnabled={settings.realTradingEnabled}
        realTradingAllowedHere={realTradingAllowed()}
      />

      <CredentialsSection />

      <section className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
        <h2 className="text-xs font-bold text-text m-0">O QUE AINDA NÃO É CONFIGURÁVEL</h2>
        <ul
          className="text-text-secondary m-0 flex flex-col gap-1"
          style={{ fontSize: 11.5, paddingLeft: 16 }}
        >
          <li>
            Limite de perda diária: a coluna existe no banco, mas nenhuma ordem é recusada por
            causa dela — então não adianta ajustar aqui.
          </li>
          <li>Moeda base, fuso e tema: a interface é fixa em BRL e escuro.</li>
          <li>
            Alavancagem: nada no motor de execução opera alavancado, todas as ordens são à vista.
          </li>
        </ul>
        <Link
          href="/trade"
          className="text-accent no-underline hover:underline"
          style={{ fontSize: 11.5 }}
        >
          Ir para a mesa →
        </Link>
      </section>
    </div>
  );
}
