import { cn } from '../../lib/utils';

export function StatCard({ title, value, badge, icon, iconBg = 'bg-amber-100 text-amber-800', className }) {
  return (
    <div
      className={cn(
        'ah-surface p-5 flex flex-col justify-between hover:shadow-sm transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <span className={cn('w-8 h-8 rounded-xl flex items-center justify-center', iconBg)}>
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2 mt-1">
        <span className="text-3xl font-bold text-on-surface tracking-tight tabular-nums">{value}</span>
        {badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#F8F5EF] text-on-surface-variant shrink-0">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
