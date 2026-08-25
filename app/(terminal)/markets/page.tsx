import { getDataSource } from '@/lib/data/index';
import { MarketsClient } from '@/components/markets/MarketsClient';

export const metadata = {
  title: 'Mercados — TradeView',
};

export default async function MarketsPage() {
  const data = await getDataSource().getMarkets();
  return <MarketsClient data={data} />;
}
