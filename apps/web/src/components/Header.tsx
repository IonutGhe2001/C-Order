import React from 'react';
import { Button } from './ui/button';
import { Icon } from '../lib/lucide-icon';

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow flex items-center justify-between px-6 z-10">
      <div className="flex items-center space-x-4">
        <button
          className="sm:block md:hidden"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <div className="text-xl font-bold">Task Manager</div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm">User</span>
        <Button size="icon" variant="outline" aria-label="User menu">
          <Icon name="user" className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}