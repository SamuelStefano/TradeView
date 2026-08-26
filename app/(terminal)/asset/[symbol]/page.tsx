import { notFound } from 'next/navigation';
import { getDataSource } from '@/lib/data';
import { parseTimeframe } from '@/lib/markets/timeframes';
import { TRADABLE, toSlug } from '@/lib/markets/catalogue';
import { AssetDetailClient } from '@/components/asset/AssetDetailClient';

type Params = { symbol: string };
type Search = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { symbol } = await params;
  const data = await getDataSource().getAsset(symbol);
  return { title: data ? `${data.asset.symbol} — TradeView` : 'Ativo não encontrado — TradeView' };
}

export default async function AssetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const [{ symbol }, search] = await Promise.all([params, searchParams]);
  const timeframe = parseTimeframe(first(search.tf));

  const data = await getDataSource().getAsset(symbol, timeframe);
  if (!data) notFound();

  return (
    <AssetDetailClient
      data={data}
      timeframe={timeframe}
      catalogue={TRADABLE.map((t) => ({
        symbol: t.symbol,
        slug: toSlug(t.symbol),
        assetClass: t.assetClass,
      }))}
    />
  );
}
