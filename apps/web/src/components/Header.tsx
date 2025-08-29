import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Icon } from '../lib/lucide-icon';
import CommandPalette from './CommandPalette';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './ui/tooltip';

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <TooltipProvider>
        <header className="sticky top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 shadow flex items-center px-4 z-10">
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="sm:block md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={onToggleSidebar}
                  aria-label="Toggle sidebar"
                >
                  <Icon name="menu" className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Toggle sidebar</TooltipContent>
            </Tooltip>
            <div className="text-xl font-bold">Task Manager</div>
          </div>
          <div className="flex-1 mx-4">
            <Input placeholder="Search..." className="w-full" />
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="primary" aria-label="Add">
                  <Icon name="plus" className="h-4 w-4 mr-2" />Add
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Command palette"
                  onClick={() => setCommandOpen(true)}
                >
                  <Icon name="command" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Command palette</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="/help"
                  className="p-2 text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Help"
                >
                  <Icon name="help-circle" className="h-4 w-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent>Help</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" aria-label="User menu">
                  <Icon name="user" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>User menu</TooltipContent>
            </Tooltip>
          </div>
        </header>
      </TooltipProvider>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}