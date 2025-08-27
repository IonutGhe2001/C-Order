import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Sheet, SheetContent } from './ui/sheet';

export default function Sidebar({
  isOpen = false,
  onOpenChange,
}: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
      isActive ? 'bg-gray-200 font-medium' : ''
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

  const groups = [
    {
      label: 'General',
      links: [{ to: '/dashboard', label: 'Dashboard' }],
    },
    {
      label: 'Tasks',
      links: [
        { to: '/tasks', label: 'Inbox' },
        { to: '/tasks?assigned=me', label: 'Assigned to me' },
        { to: '/tasks?status=done', label: 'Completed' },
      ],
    },
  ];

  const renderContent = () => {
    let i = -1;
    return groups.map((group) => (
      <div key={group.label} className="mb-6">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
          {group.label}
        </div>
        <nav className="space-y-1">
          {group.links.map((l) => {
            i++;
            return (
              <NavLink
                key={l.label}
                to={l.to}
                className={linkClass}
                ref={(el) => (linkRefs.current[i] = el!)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              >
                {l.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    ));
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="p-4 w-60 md:hidden left-0 right-auto border-r">
          {renderContent()}
        </SheetContent>
      </Sheet>
      <aside
        role="navigation"
        className="hidden md:block fixed top-14 left-0 bottom-0 w-60 bg-gray-50 border-r p-4 overflow-y-auto"
      >
        {renderContent()}
      </aside>
    </>
  );
}