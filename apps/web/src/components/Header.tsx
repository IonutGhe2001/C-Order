import React, { useEffect, useState } from 'react';
import { Icon } from '../lib/lucide-icon';
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
// Columns menu removed; column configuration handled elsewhere
import CreateTaskSheet from './tasks/CreateTaskSheet';
import StatusManager from './StatusManager';
import { logout } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';

interface HeaderProps {
  onToggleSidebar: () => void;
  view?: 'table' | 'card';
  setView?: React.Dispatch<React.SetStateAction<'table' | 'card'>>;
}

export default function Header({ onToggleSidebar, view, setView }: HeaderProps) {
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [statusManagerOpen, setStatusManagerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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
          <div className="flex items-center ml-auto z-10">
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label={t('labels.userMenu')}
                      className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                      <div className="h-8 w-8 rounded-full bg-brand text-brand-fg flex items-center justify-center">
                        <Icon name="user" className="h-4 w-4" />
                      </div>
                      {user && (
                        <div className="hidden sm:flex flex-col items-start leading-tight">
                          <span className="text-sm font-medium">{user.name}</span>
                          <span className="text-xs text-brand-fg/70 capitalize">
                            {user.role.toLowerCase()}
                          </span>
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('labels.userMenu')}</TooltipContent>
                <DropdownMenuContent align="end">
                  {user && (
                    <div className="px-2 py-1.5 text-sm border-b border-brand-muted mb-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-brand-fg/70 capitalize">
                        {user.role.toLowerCase()}
                      </div>
                    </div>
                  )}
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setTaskSheetOpen(true);
                    }}
                  >
                    {t('buttons.addTask')}
                  </DropdownMenuItem>
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
      <CreateTaskSheet open={taskSheetOpen} onOpenChange={setTaskSheetOpen} showTrigger={false} />
      <StatusManager open={statusManagerOpen} onOpenChange={setStatusManagerOpen} />
    </>
  );
}