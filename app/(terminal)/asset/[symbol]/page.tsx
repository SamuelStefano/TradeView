import { getDataSource } from '@/lib/data';
import { ASSET_CLASSES } from '@/lib/types';
import type { AssetClass } from '@/lib/types';
import type { AssetDetailData } from '@/lib/data/mock/assets';
import { EmptyState } from '@/components/ui/EmptyState';
import { AssetDetailClient } from '@/components/asset/AssetDetailClient';

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const ds = getDataSource();

  const data = await ds.getAsset(symbol);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <EmptyState
          title="Ativo não encontrado"
          description={`O símbolo "${symbol}" não existe na base de dados mockada.`}
        />
      </div>
    );
  }

  const defaultSymbols = await ds.getDefaultSymbols();

  const allData = await Promise.all(
    ASSET_CLASSES.map(async (cls) => {
      const d = await ds.getAsset(defaultSymbols[cls]);
      return [cls, d] as [AssetClass, AssetDetailData | null];
    })
  );

  const allDataMap = Object.fromEntries(
    allData.filter(([, d]) => d !== null)
  ) as Record<AssetClass, AssetDetailData>;

  const initialClass = data.asset.assetClass;

  return (
    <AssetDetailClient
      initialClass={initialClass}
      allData={allDataMap}
    />
  );
}
