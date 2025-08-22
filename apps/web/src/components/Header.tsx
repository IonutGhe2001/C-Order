import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow flex items-center justify-between px-6 z-10">
      <div className="text-xl font-bold">Procurement</div>
      <div className="flex items-center space-x-4">
        <span className="text-sm">User</span>
        <button className="w-8 h-8 rounded-full bg-gray-200" aria-label="User menu"></button>
      </div>
    </header>
  );
}