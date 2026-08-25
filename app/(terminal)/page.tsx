import { getDataSource } from '@/lib/data';

export default async function OverviewPage() {
  const data = await getDataSource().getOverview();

  return (
    <main className="p-4">
      <h1 className="text-sm font-medium text-text">Overview</h1>
      <p className="mt-2 font-mono text-xs tabular-nums text-text-secondary">
        {data.netWorth.brl}
      </p>
    </main>
  );
}
