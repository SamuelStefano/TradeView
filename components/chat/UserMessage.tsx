interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <div className="self-end bg-active border border-accent-border/60 text-sm leading-relaxed" style={{
      maxWidth: '60%',
      borderRadius: '10px 10px 2px 10px',
      padding: '9px 13px',
    }}>
      {text}
    </div>
  );
}
