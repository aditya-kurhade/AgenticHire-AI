import { cn } from '../../lib/utils';

export function PageHeader({
  title,
  description,
  badge,
  actions,
  icon: Icon,
  category,
  className
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pb-4 border-b border-border/70",
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className="shrink-0 p-1.5 rounded-lg bg-secondary border border-border text-foreground/80">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold tracking-tight text-foreground leading-tight">
              {title}
            </h1>
            {category && (
              <span className="hidden sm:inline-block text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 bg-secondary/80 border border-border/50 px-1.5 py-0.5 rounded">
                {category}
              </span>
            )}
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl leading-normal truncate sm:whitespace-normal">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
