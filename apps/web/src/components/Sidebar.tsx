import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent } from './ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Icon } from '../lib/lucide-icon';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Sidebar({
  isOpen = false,
  onOpenChange,
}: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const linkClass = (isActive: boolean) =>
    `flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
      collapsed ? 'justify-center p-2' : 'px-4 py-2'
    } ${
      isActive
        ? 'text-brand border-l-4 border-brand'
        : 'text-brand-fg hover:bg-brand-muted'
    }`;

  const linkRefs = useRef<HTMLAnchorElement[]>([]);
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    index: number
  ) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      linkRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      linkRefs.current[index - 1]?.focus();
    }
  };

  const { t } = useTranslation();
  const groups = [
    {
      label: t('labels.general'),
      links: [{ to: '/dashboard', label: t('nav.dashboard') }],
    },
    {
      label: t('nav.tasks'),
      links: [
        { to: '/tasks', label: t('labels.inbox') },
        { to: '/tasks?assigned=me', label: t('labels.assignedToMe') },
        { to: '/tasks?status=done', label: t('labels.completed') },
      ],
    },
  ];
  
  const location = useLocation();
  const renderContent = () => {
    let i = -1;
    return groups.map((group) => (
      <div key={group.label} className="mb-6">
        {!collapsed && (
          <div className="text-xs font-semibold text-brand-fg uppercase mb-2">
            {group.label}
          </div>
        )}
        <nav className="space-y-1">
          {group.links.map((l) => {
            i++;
            const isActive =
              location.pathname + location.search === l.to;
            const link = (
              <Link
                key={l.label}
                to={l.to}
                className={linkClass(isActive)}
                ref={(el) => (linkRefs.current[i] = el!)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                aria-label={collapsed ? l.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={collapsed ? 'sr-only' : ''}>{l.label}</span>
              </Link>
            );
            return collapsed ? (
              <Tooltip key={l.label}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{l.label}</TooltipContent>
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>
      </div>
    ));
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="p-4 w-60 md:hidden left-0 right-auto border-r bg-white dark:bg-brand-muted">
          <TooltipProvider>{renderContent()}</TooltipProvider>
        </SheetContent>
      </Sheet>
      <aside
        role="navigation"
        className={`hidden md:flex flex-col fixed top-14 left-0 bottom-0 bg-white dark:bg-brand-muted border-r overflow-y-auto transition-all duration-300 motion-reduce:transition-none ${
          collapsed ? 'w-[72px] p-2' : 'w-60 p-4'
        }`}
      >
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 mb-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          aria-label={t('buttons.toggleSidebar')}
          whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.97, transition: { duration: 0.15 } }}
        >
          <Icon
            name={collapsed ? 'chevron-right' : 'chevron-left'}
            className="h-4 w-4"
          />
        </motion.button>
        <TooltipProvider>{renderContent()}</TooltipProvider>
      </aside>
    </>
  );
}