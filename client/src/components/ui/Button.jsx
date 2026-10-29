import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
  {
    variants: {
      variant: {
        primary: 'primary-gradient text-white shadow-sm hover:shadow hover:brightness-105',
        secondary: 'bg-primary text-white shadow-xs hover:brightness-105',
        outline: 'border border-[#e8ded5] bg-white text-on-surface-variant hover:bg-[#F8F5EF] hover:text-on-surface shadow-2xs',
        ghost: 'text-on-surface-variant hover:bg-[#F8F5EF] hover:text-on-surface',
        soft: 'bg-[#F8F5EF] border border-[#e8ded5] text-primary hover:border-primary hover:bg-primary/5',
        danger: 'bg-error-container/40 text-error border border-error/20 hover:bg-error-container',
      },
      size: {
        sm: 'px-2.5 py-1.5 text-[11px]',
        md: 'px-4 py-2.5',
        lg: 'px-5 py-3 text-sm',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export { buttonVariants };
