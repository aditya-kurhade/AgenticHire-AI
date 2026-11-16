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
        "relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border/80 transition-all",
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {Icon && (
          <div className="shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary border border-primary/20 shadow-xs ring-1 ring-primary/10">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}

        <div className="space-y-1 min-w-0 flex-1">
          {category && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              <span>{category}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground/90 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center pt-1 md:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
