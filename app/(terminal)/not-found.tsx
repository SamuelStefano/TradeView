import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';

export default function TerminalNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <EmptyState
        title="Ativo não encontrado"
        description="Esse símbolo não existe na base de dados."
      />
      <Link href="/" className="text-xs">
        Voltar ao overview
      </Link>
    </div>
  );
}
