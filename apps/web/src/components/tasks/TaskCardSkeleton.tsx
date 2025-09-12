import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function TaskCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-1 text-xs">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}