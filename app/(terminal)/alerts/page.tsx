import { NotBuilt } from '@/components/ui/NotBuilt';

export const metadata = {
  title: 'Alertas — TradeView',
};

export default function AlertsPage() {
  return (
    <NotBuilt
      title="Alertas"
      missing={[
        'uma tabela de alertas — o banco não tem nenhuma',
        'um processo que avalie a condição fora do request, já que a página só roda quando aberta',
        'um canal de entrega ligado de verdade (push, e-mail, Telegram: nenhum existe)',
        'registro de disparo, sem o qual não dá para dizer se o alerta acertou',
      ]}
      goes={[
        { label: 'Ver um ativo', href: '/asset/BTC-BRL' },
        { label: 'Ver os mercados conectados', href: '/markets' },
      ]}
    />
  );
}
