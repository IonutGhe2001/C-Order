import React from 'react';
import { Button } from './ui/button';

interface EmptyStateProps {
  onReset: () => void;
}

export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="mb-4 text-sm text-muted-foreground">No data available</p>
      <Button variant="secondary" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  );
}