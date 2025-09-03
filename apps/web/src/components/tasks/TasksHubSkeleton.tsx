import React from 'react';
import { TasksToolbarSkeleton } from './TasksToolbar';
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
      <TasksToolbarSkeleton />
      <TasksDataTableSkeleton isMobile={isMobile} />
    </div>
  );
}