import { cn } from '../../lib/utils';

export function Card({ className, hover = false, children, ...props }) {
  return (
    <div
      className={cn(
        'ah-surface',
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-base font-bold text-on-surface tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-on-surface-variant font-medium mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}
