interface FailureBannerProps {
  message: string;
  onRetry: () => void;
}

export function FailureBanner({ message, onRetry }: FailureBannerProps) {
  return (
    <div
      className="bg-down-bg border border-danger-border flex items-center gap-3"
      style={{ maxWidth: '86%', borderRadius: '8px', padding: '12px 16px' }}
      role="alert"
      aria-live="assertive"
    >
      <span className="text-down" style={{ fontSize: '15px' }} aria-hidden="true">
        ✕
      </span>
      <div className="flex-1">
        <div className="text-down font-semibold" style={{ fontSize: '12.5px' }}>
          {message}
        </div>
        <div className="text-text-muted mt-0.5" style={{ fontSize: '11px' }}>
          Sua pergunta foi preservada.
        </div>
      </div>
      <button
        onClick={onRetry}
        className="h-7 px-3 bg-down-strong border border-danger-border rounded-md text-down font-semibold cursor-pointer hover:bg-down-bg transition-colors"
        style={{ fontSize: '11.5px' }}
      >
        Tentar de novo
      </button>
    </div>
  );
}
