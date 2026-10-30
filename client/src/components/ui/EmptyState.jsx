import React from 'react';
import { cn } from '../../lib/utils';
import { HelpCircle } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({ icon: Icon, title, description, action, actionLabel, onAction, className }) {
  const renderIcon = () => {
    if (!Icon) return <HelpCircle className="w-6 h-6" />;
    if (typeof Icon === 'string') {
      return <span className="material-symbols-outlined text-[24px]">{Icon}</span>;
    }
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const Component = Icon;
    return <Component className="w-6 h-6" />;
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-card/50", className)}>
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
        {renderIcon()}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4">{description}</p>
      {action ? (
        <div>{action}</div>
      ) : actionLabel && onAction ? (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}