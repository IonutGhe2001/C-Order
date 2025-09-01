import React from 'react';
import { Card } from '@tremor/react';
import { Skeleton } from '../ui/skeleton';

export default function KpiSkeleton() {
  return (
    <Card className="p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32 mt-2" />
      <Skeleton className="h-12 w-full mt-4" />
    </Card>
  );
}