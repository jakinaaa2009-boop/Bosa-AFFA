import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit';
};

const variantStyles: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-white text-slate-900 hover:bg-white/90 shadow-[0_10px_30px_rgba(56,189,248,0.18)]',
  secondary:
    'bg-white/10 text-white hover:bg-white/15 ring-1 ring-white/20 shadow-[0_10px_30px_rgba(37,99,235,0.22)]',
  ghost: 'bg-transparent text-white hover:bg-white/10 ring-1 ring-white/15'
};

const sizeStyles: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-sm',
  lg: 'h-14 px-6 text-base'
};

export function Button({
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button'
}: Props) {
  const base = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={base}>
      {children}
    </button>
  );
}

