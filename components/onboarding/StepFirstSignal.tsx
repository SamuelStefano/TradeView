export function StepFirstSignal() {
  return (
    <div>
      <h1 className="text-text font-bold" style={{ margin: '0 0 6px', fontSize: 20 }}>
        Seu primeiro sinal
      </h1>
      <p className="text-text-muted" style={{ margin: '0 0 16px', fontSize: '12.5px' }}>
        A IA já analisou os mercados que você escolheu.
      </p>
      <div
        className="border rounded-lg"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-ai-border)', padding: 14 }}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-semibold text-text">BTC/USDT</span>
          <span className="font-bold text-up" style={{ fontSize: '10.5px' }}>▲ LONG</span>
          <span className="text-text-faint" style={{ fontSize: '10px' }}>3–7 dias</span>
          <span className="ml-auto font-mono" style={{ fontSize: '11.5px', color: 'var(--color-ai)' }}>
            convicção 87
          </span>
        </div>
        <div
          className="text-text-secondary leading-relaxed"
          style={{ fontSize: '12.5px', marginTop: 8 }}
        >
          Funding negativo com open interest subindo: posicionamento vendido esticado abre espaço
          para squeeze.
        </div>
        <div className="text-text-faint" style={{ fontSize: '10.5px', marginTop: 8 }}>
          Sinais são análise, não recomendação. Nada é executado sem você.
        </div>
      </div>
    </div>
  );
}
