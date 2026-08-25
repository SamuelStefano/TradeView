interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 ${className}`}>
      <div className="text-text-faint text-2xl select-none">○</div>
      <div className="text-sm font-medium text-text-secondary">{title}</div>
      {description && (
        <p className="text-xs text-text-muted text-center max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 h-7 px-3 bg-accent-bg border border-accent-border rounded-md text-accent text-xs font-medium cursor-pointer hover:bg-accent-bg-soft transition-colors font-sans"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
