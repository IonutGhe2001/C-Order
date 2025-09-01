import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export default function QuickActions() {
  const actions = [
    { label: 'New task', href: '/tasks/new' },
    { label: 'New supplier', href: '/suppliers/new' },
    { label: 'Reports', href: '/reports' },
    { label: 'My inbox', href: '/tasks?assigned=me' },
  ];

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <Button
          key={action.href}
          asChild
          variant="secondary"
          className="w-full justify-start"
        >
          <Link to={action.href} aria-label={action.label}>
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}