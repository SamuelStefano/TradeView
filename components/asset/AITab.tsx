import Link from 'next/link';

interface AITabProps {
  symbol: string;
}

export function AITab({ symbol }: AITabProps) {
  return (
    <div className="py-3.5 flex flex-col gap-3 max-w-[620px]">
      <p className="m-0 text-text-secondary leading-relaxed" style={{ fontSize: '12.5px' }}>
        Não há tese gerada para {symbol}. A análise não roda sozinha a cada abertura de tela:
        cada execução custa uma chamada de modelo, e uma tese antiga apresentada como atual vale
        menos que nenhuma.
      </p>
      <p className="m-0 text-text-muted leading-relaxed" style={{ fontSize: '11.5px' }}>
        O Analyst também não recebe cotação, book nem posição — ele raciocina sobre mecanismo e
        risco, e recusa inventar preço ou manchete. Leve o número desta tela para a conversa.
      </p>
      <Link
        href={`/chat?assunto=${encodeURIComponent(symbol)}`}
        className="inline-flex items-center self-start no-underline rounded-md border border-accent-border bg-accent-bg text-accent-hover font-semibold"
        style={{ height: 30, padding: '0 14px', fontSize: '12px' }}
      >
        Abrir o Analyst com {symbol}
      </Link>
    </div>
  );
}
