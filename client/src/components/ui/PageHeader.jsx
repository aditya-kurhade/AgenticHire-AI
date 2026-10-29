import { cn } from '../../lib/utils';

export function PageHeader({ title, description, badge, actions, className }) {
  return (
    <section
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-4',
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-2xl md:text-[1.75rem] font-bold tracking-tight text-on-surface text-balance">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-on-surface-variant font-medium max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </section>
  );
}
