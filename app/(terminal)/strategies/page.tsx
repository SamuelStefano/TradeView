import { getDataSource } from '@/lib/data/index';
import { StrategiesClient } from '@/components/strategies/StrategiesClient';

export default async function StrategiesPage() {
  const strategies = await getDataSource().getStrategies();
  return <StrategiesClient strategies={strategies} />;
}
