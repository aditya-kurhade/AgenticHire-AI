import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border',
  {
    variants: {
      tone: {
        default: 'bg-[#F8F5EF] text-on-surface-variant border-[#e8ded5]',
        primary: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  }
);

const statusTone = {
  shortlist: 'success',
  pending: 'warning',
  reject: 'danger',
  rejected: 'danger',
  active: 'success',
  running: 'info',
  success: 'success',
  failed: 'danger',
  paused_approval: 'warning',
};

export function Badge({ className, tone, status, children, ...props }) {
  const resolvedTone = tone || statusTone[status] || 'default';
  return (
    <span className={cn(badgeVariants({ tone: resolvedTone }), className)} {...props}>
      {children ?? status}
    </span>
  );
}
