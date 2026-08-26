import Link from 'next/link';

interface NotBuiltProps {
  title: string;
  // What the screen would need before it can show anything true. Naming the
  // missing piece is the difference between "coming soon" and an honest gap.
  missing: string[];
  goes: { label: string; href: string }[];
}

export function NotBuilt({ title, missing, goes }: NotBuiltProps) {
  return (
    <div className="p-5 flex flex-col gap-4 max-w-[620px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-text" style={{ fontSize: '16px', fontWeight: 700 }}>
          {title}
        </h1>
        <p className="m-0 text-text-secondary" style={{ fontSize: '12px' }}>
          Esta tela ainda não existe. O que estava aqui antes era um exemplo montado à mão —
          números que nenhum código calculava — então saiu.
        </p>
      </div>

      <section className="bg-surface border border-border rounded-lg p-3.5 flex flex-col gap-2">
        <span
          className="text-text-muted font-medium uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          Falta para funcionar
        </span>
        <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
          {missing.map((item) => (
            <li
              key={item}
              className="text-text-secondary flex gap-2"
              style={{ fontSize: '12px' }}
            >
              <span className="text-text-faint">·</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-2 flex-wrap">
        {goes.map((go) => (
          <Link
            key={go.href}
            href={go.href}
            className="h-8 px-3 inline-flex items-center rounded-md border border-border bg-chrome text-text-muted no-underline hover:text-text"
            style={{ fontSize: '12px' }}
          >
            {go.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
