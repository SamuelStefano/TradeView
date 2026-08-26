import { NotBuilt } from '@/components/ui/NotBuilt';

export const metadata = {
  title: 'Analytics — TradeView',
};

export default function AnalyticsPage() {
  return (
    <NotBuilt
      title="Analytics & insights"
      missing={[
        'teses da IA gravadas com o preço do momento, para depois medir acerto contra o mercado',
        'contabilidade de tokens por chamada — o Analyst responde, mas nada registra o custo',
        'histórico de ordens não executadas, base para calcular oportunidade perdida',
      ]}
      goes={[
        { label: 'Abrir o Analyst', href: '/chat' },
        { label: 'Ver o portfólio', href: '/portfolio' },
      ]}
    />
  );
}
