import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200 font-medium' : ''}`;
  return (
    <aside className="fixed top-14 left-0 bottom-0 w-60 bg-gray-50 border-r p-4">
      <nav className="space-y-1">
        <NavLink to="/tasks" className={linkClass}>Tasks</NavLink>
      </nav>
    </aside>
  );
}