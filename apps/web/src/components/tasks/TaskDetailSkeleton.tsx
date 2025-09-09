import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function TaskDetailSkeleton() {
  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-10 bg-background border-b p-2 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <Skeleton className="h-10 w-64 flex-1" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </header>

      <div className="grid w-full grid-cols-4 gap-2 md:w-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>

      <div className="space-y-4">
        <div className="border rounded-md p-4 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="border rounded-md p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="border rounded-md p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="border rounded-md p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}