import Link from 'next/link';

export function CredentialsSection() {
  return (
    <section className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
      <h2 className="text-xs font-bold text-text m-0">CREDENCIAIS DE CORRETORA</h2>
      <p className="text-text-secondary m-0" style={{ fontSize: 11.5 }}>
        Nenhuma. O app lê apenas dado público das venues e executa em modo papel contra o book ao
        vivo — nada aqui assina uma ordem na sua conta da corretora.
      </p>
      <p className="text-text-faint m-0" style={{ fontSize: 11 }}>
        A tabela cifrada para guardar chave existe no banco, mas nenhum código escreve nem lê
        dela. Enquanto for assim, não há o que revogar ou rotacionar nesta tela.
      </p>
      <Link
        href="/markets"
        className="text-accent no-underline hover:underline"
        style={{ fontSize: 11.5 }}
      >
        Ver as venues conectadas →
      </Link>
    </section>
  );
}
