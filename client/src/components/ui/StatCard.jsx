import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '../../lib/utils';

export function StatCard({ title, value, badge, icon: Icon, iconBg, className }) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === 'string') {
      return <span className="material-symbols-outlined text-[20px]">{Icon}</span>;
    }
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const Component = Icon;
    return <Component className="w-5 h-5" />;
  };

  return (
    <Card className={cn("overflow-hidden hover:border-foreground/20 transition-all", className)}>
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
            {badge && (
              <span className="text-[11px] font-medium text-muted-foreground/80">
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconBg || "bg-primary/10 text-primary")}>
            {renderIcon()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}