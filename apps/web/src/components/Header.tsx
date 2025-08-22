import React from 'react';
import { Button } from './ui/button';
import { User } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow flex items-center justify-between px-6 z-10">
      <div className="text-xl font-bold">Procurement</div>
      <div className="flex items-center space-x-4">
        <span className="text-sm">User</span>
        <Button size="icon" variant="outline" aria-label="User menu">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}