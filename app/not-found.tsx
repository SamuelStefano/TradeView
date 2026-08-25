import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <EmptyState
          title="Página não encontrada"
          description="Essa rota não existe no terminal."
        />
        <Link href="/" className="text-xs">
          Voltar ao overview
        </Link>
      </div>
    </main>
  );
}
