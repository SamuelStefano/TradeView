import type { MissedEntry } from '@/lib/data/views/analytics';

interface MissedOpportunitiesProps {
  opportunityCost: string;
  missed: MissedEntry[];
}

export function MissedOpportunities({ opportunityCost, missed }: MissedOpportunitiesProps) {
  return (
    <section
      aria-label="Oportunidade perdida"
      className="bg-surface border border-border rounded-lg p-3.5"
    >
      <div className="flex items-baseline gap-2.5 mb-2.5">
        <span
          className="text-text-muted uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          O que eu deixei de ganhar
        </span>
        <span className="text-text-faint" style={{ fontSize: '10.5px' }}>
          sinais com convicção ≥ 70 que você ignorou
        </span>
        <span className="ml-auto font-mono text-warn" style={{ fontSize: '13px' }}>
          custo de oportunidade 90d: {opportunityCost}
        </span>
      </div>

      <table
        className="w-full border-collapse font-mono tabular-nums"
        style={{ fontSize: '11px' }}
      >
        <thead>
          <tr className="border-b border-border text-text-faint" style={{ fontSize: '10px' }}>
            <th scope="col" className="text-left font-normal py-1.5 px-2" style={{ width: '90px' }}>data</th>
            <th scope="col" className="text-left font-normal py-1.5 px-2" style={{ width: '110px' }}>ativo</th>
            <th scope="col" className="text-left font-normal py-1.5 px-2" style={{ width: '70px' }}>direção</th>
            <th scope="col" className="text-right font-normal py-1.5 px-2" style={{ width: '80px' }}>convicção</th>
            <th scope="col" className="text-right font-normal py-1.5 px-2">se tivesse seguido</th>
            <th scope="col" className="text-right font-normal py-1.5 px-2">resultado do sinal</th>
            <th scope="col" className="text-right font-normal py-1.5 px-2">status</th>
          </tr>
        </thead>
        <tbody>
          {missed.map((m) => (
            <tr key={m.id} className="border-b border-divider last:border-b-0 text-text-secondary">
              <td className="text-text-faint py-1.5 px-2">{m.date}</td>
              <td className="py-1.5 px-2">{m.asset}</td>
              <td className={`py-1.5 px-2 ${m.directionTone === 'up' ? 'text-up' : 'text-down'}`}>
                {m.direction}
              </td>
              <td className="text-right py-1.5 px-2 text-ai">{m.conviction}</td>
              <td className={`text-right py-1.5 px-2 ${m.gainTone === 'up' ? 'text-up' : 'text-down'}`}>
                {m.gain}
              </td>
              <td className="text-right py-1.5 px-2">{m.result}</td>
              <td className="text-right py-1.5 px-2 text-text-faint">ignorado</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
