import { NotBuilt } from '@/components/ui/NotBuilt';

export const metadata = {
  title: 'Estratégias — TradeView',
};

export default function StrategiesPage() {
  return (
    <NotBuilt
      title="Estratégias"
      missing={[
        'uma tabela para guardar estratégias — o banco não tem nenhuma',
        'um runner que execute a estratégia contra o mercado e registre ordens',
        'histórico de retorno, sem o qual Sharpe, drawdown e win rate não existem',
        'um backtest de verdade sobre os candles que as venues já servem',
      ]}
      goes={[
        { label: 'Ver a mesa', href: '/trade' },
        { label: 'Ver os mercados conectados', href: '/markets' },
      ]}
    />
  );
}
