import { cn } from '@/lib/utils';

export function GlassCard({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/15 shadow-[0_20px_60px_rgba(2,6,23,0.55)]',
        className
      )}
    >
      {children}
    </div>
  );
}

