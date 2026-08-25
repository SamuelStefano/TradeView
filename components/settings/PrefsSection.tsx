const PREFS = [
  { k: 'Moeda base', v: 'BRL' },
  { k: 'Timezone', v: 'America/Sao_Paulo' },
  { k: 'Formato numérico', v: 'pt-BR · 1.234,56' },
  { k: 'Tema', v: 'escuro' },
  { k: 'Densidade', v: 'confortável' },
  { k: 'Paleta daltônica', v: 'desligada' },
  { k: 'Reduzir animações', v: 'segue o sistema' },
];

export function PrefsSection() {
  return (
    <section
      aria-label="Preferências"
      className="bg-surface border border-border rounded-lg p-3.5 flex flex-col gap-2.5"
    >
      <div
        className="text-text-muted font-medium uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.6px' }}
      >
        Preferências
      </div>
      {PREFS.map((p) => (
        <div key={p.k} className="flex items-center gap-2.5" style={{ fontSize: '12px' }}>
          <span className="flex-1 text-text-secondary">{p.k}</span>
          <span
            className="font-mono text-text bg-inset border border-border-strong rounded-md"
            style={{ fontSize: '11.5px', padding: '4px 10px' }}
          >
            {p.v}
          </span>
        </div>
      ))}
      <div className="text-text-faint leading-relaxed" style={{ fontSize: '10.5px' }}>
        Paleta daltônica troca verde/vermelho por azul/laranja e mantém setas e sinais (+/−) em todos
        os números. Layouts de painéis são salvos por usuário.
      </div>
    </section>
  );
}
