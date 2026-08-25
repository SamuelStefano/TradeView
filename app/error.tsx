'use client';

import { EmptyState } from '@/components/ui/EmptyState';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        title="Algo quebrou nesta tela"
        description="O restante do terminal continua funcionando."
        action={{ label: 'Tentar de novo', onClick: reset }}
      />
    </main>
  );
}
