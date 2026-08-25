interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
}

export function Skeleton({ width, height = 16, rounded = 'rounded', className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-border-strong animate-pulse ${rounded} ${className}`}
      style={{
        width: width !== undefined ? width : '100%',
        height,
      }}
    />
  );
}
