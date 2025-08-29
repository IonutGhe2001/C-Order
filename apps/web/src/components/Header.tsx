import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Icon } from '../lib/lucide-icon';
import CommandPalette from './CommandPalette';
import { motion } from 'framer-motion';
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
    <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-0 left-0 m-2 p-2 bg-white dark:bg-gray-900 text-brand z-50"
      >
        Skip to content
      </a>
      <TooltipProvider>
        <header className="sticky top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 shadow flex items-center px-4 z-10 relative">
          <div className="flex items-center space-x-4 flex-shrink-0 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className="sm:block md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={onToggleSidebar}
                  aria-label="Toggle sidebar"
                  whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.97, transition: { duration: 0.15 } }}
                >
                  <Icon name="menu" className="h-5 w-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Toggle sidebar</TooltipContent>
            </Tooltip>
            <div className="text-xl font-bold">Task Manager</div>
          </div>
          <div className="flex items-center space-x-2 ml-auto z-10">
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
          <div className="absolute inset-x-0 flex justify-center px-4 pointer-events-none">
            <Input placeholder="Search..." className="w-full max-w-md pointer-events-auto" />
          </div>
        </header>
      </TooltipProvider>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}