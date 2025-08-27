import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen = false }: { isOpen?: boolean }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200 font-medium' : ''}`;

  const groups = [
    {
      label: 'Tasks',
      links: [
        { to: '/tasks', label: 'Inbox' },
        { to: '/tasks?assigned=me', label: 'Assigned to me' },
        { to: '/tasks?status=done', label: 'Completed' },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-14 left-0 bottom-0 w-60 bg-gray-50 border-r p-4 overflow-y-auto ${
        isOpen ? 'block' : 'hidden'
      } md:block`}
    >
      {groups.map((group) => (
        <div key={group.label} className="mb-6">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {group.label}
          </div>
          <nav className="space-y-1">
            {group.links.map((l) => (
              <NavLink key={l.label} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}
    </aside>
  );
}