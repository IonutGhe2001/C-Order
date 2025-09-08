import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TasksDataTableSkeleton } from './DataTable';

export default function TasksHubSkeleton() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handle = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    handle(mq);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 justify-between">
        <div className="flex flex-wrap items-end gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <TasksDataTableSkeleton isMobile={isMobile} />
    </div>
  );
}