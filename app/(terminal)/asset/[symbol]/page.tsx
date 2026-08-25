export default async function AssetDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;

  return (
    <div className="p-6">
      <h1 className="text-sm font-semibold text-text-muted uppercase" style={{ letterSpacing: '0.6px' }}>
        Ativo: {symbol}
      </h1>
    </div>
  );
}
