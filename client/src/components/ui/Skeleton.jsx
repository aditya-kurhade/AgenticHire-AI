import { cn } from '../../lib/utils';

export function Skeleton({ className }) {
  return <div className={cn('ah-skeleton', className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32 hidden md:block" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Skeleton className="lg:col-span-8 h-72 rounded-2xl" />
        <Skeleton className="lg:col-span-4 h-72 rounded-2xl" />
      </div>
    </div>
  );
}
