import React from 'react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  onReset?: () => void;
}

export default function EmptyState({ title, description, onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      {onReset && (
        <Button variant="secondary" onClick={onReset}>
          Reset filters
        </Button>
      )}
    </div>
  );
}