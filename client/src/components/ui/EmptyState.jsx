import { cn } from '../../lib/utils';
import { Button } from './Button';

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-dashed border-[#dcc1b1] bg-[#F8F5EF]/50',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-[#e8ded5] flex items-center justify-center text-primary shadow-xs mb-3">
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <h4 className="text-sm font-bold text-on-surface">{title}</h4>
      {description && (
        <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
