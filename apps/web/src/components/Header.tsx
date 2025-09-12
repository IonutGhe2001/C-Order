import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Icon } from '../lib/lucide-icon';
import CommandPalette from './CommandPalette';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import ColumnsMenu from './tasks/ColumnsMenu';
import { Table, VisibilityState } from '@tanstack/react-table';
import CreateTaskSheet from './tasks/CreateTaskSheet';
import StatusManager from './StatusManager';
import { logout } from '@/lib/api';

interface HeaderProps {
  onToggleSidebar: () => void;
  table?: Table<any>;
  columnVisibility?: VisibilityState;
  view?: 'table' | 'card';
  setView?: React.Dispatch<React.SetStateAction<'table' | 'card'>>;
}

export default function Header({ onToggleSidebar, table, columnVisibility, view, setView }: HeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [statusManagerOpen, setStatusManagerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        className="sr-only focus:not-sr-only absolute top-0 left-0 m-2 p-2 bg-brand text-brand-fg z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        {t('labels.skipToContent')}
      </a>
      <TooltipProvider>
        <header
          className={`sticky top-0 left-0 right-0 h-14 bg-brand dark:bg-brand-muted text-brand-fg flex items-center px-4 z-10 relative transition-shadow ${scrolled ? 'shadow-sm' : ''}`}
        >
          <div className="flex items-center space-x-4 flex-shrink-0 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className="sm:block md:hidden text-brand-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  onClick={onToggleSidebar}
                  aria-label={t('buttons.toggleSidebar')}
                  whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.97, transition: { duration: 0.15 } }}
                >
                  <Icon name="menu" className="h-5 w-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>{t('buttons.toggleSidebar')}</TooltipContent>
            </Tooltip>
            <div className="text-xl font-bold">{t('titles.appName')}</div>
          </div>
          <div className="flex items-center space-x-2 ml-auto z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-brand-fg"
                  aria-label={t('labels.commandPalette')}
                  onClick={() => setCommandOpen(true)}
                >
                  <Icon name="command" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('labels.commandPalette')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="/help"
                  className="p-2 text-brand-fg hover:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  aria-label={t('labels.help')}
                >
                  <Icon name="help-circle" className="h-4 w-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent>{t('labels.help')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={t('labels.userMenu')}
                      className="text-brand-fg border-brand-fg"
                    >
                      <Icon name="user" className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('labels.userMenu')}</TooltipContent>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setTaskSheetOpen(true);
                    }}
                  >
                    {t('buttons.addTask')}
                  </DropdownMenuItem>
                  {table && columnVisibility && (
                    <ColumnsMenu table={table} visibility={columnVisibility}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        {t('labels.columns')}
                      </DropdownMenuItem>
                    </ColumnsMenu>
                  )}
                  {view && setView && (
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setView(view === 'table' ? 'card' : 'table');
                      }}
                    >
                      {view === 'table'
                        ? t('labels.cardView', { defaultValue: 'Card view' })
                        : t('labels.tableView', { defaultValue: 'Table view' })}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      window.dispatchEvent(new Event('open-customize-columns'));
                    }}
                  >
                    {t('buttons.editColumns', { defaultValue: 'Edit columns' })}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setStatusManagerOpen(true);
                    }}
                  >
                    {t('buttons.manageStatuses', { defaultValue: 'Manage statuses' })}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      logout().then(() => (window.location.href = '/login'));
                    }}
                  >
                    {t('buttons.logout', { defaultValue: 'Logout' })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </div>
        </header>
      </TooltipProvider>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <CreateTaskSheet open={taskSheetOpen} onOpenChange={setTaskSheetOpen} showTrigger={false} />
      <StatusManager open={statusManagerOpen} onOpenChange={setStatusManagerOpen} />
    </>
  );
}