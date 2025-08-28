import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTasks } from '../lib/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ViewSwitcher() {
  const { t } = useTranslation();
  const links = [
    { to: '/tasks', label: t('nav.list') },
    { to: '/tasks/board', label: t('nav.board') },
    { to: '/tasks/calendar', label: t('nav.calendar') },
    { to: '/tasks/timeline', label: t('nav.timeline') },
  ];
  return (
    <div className="flex space-x-2 mr-4">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `px-3 py-1 rounded ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200'}`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </div>
  );
}

export default function TasksTimeline() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data } = useQuery({ queryKey: ['tasks'], queryFn: () => listTasks() });
  const { t } = useTranslation();
  const tasks = useMemo(() => {
    return (data?.items || []).filter(
      (t: any) => t.orderDate && (t.deliveryDate || t.dueDate)
    );
  }, [data]);

  const min = useMemo(() => {
    return tasks.length
      ? Math.min(...tasks.map((t: any) => new Date(t.orderDate).getTime()))
      : Date.now();
  }, [tasks]);
  const max = useMemo(() => {
    return tasks.length
      ? Math.max(
          ...tasks.map((t: any) =>
            new Date(t.deliveryDate || t.dueDate).getTime()
          )
        )
      : Date.now();
  }, [tasks]);
  const total = max - min || 1;

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main className="pt-14 md:ml-60 ml-0 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{t('nav.timeline')}</h1>
          <ViewSwitcher />
        </div>
        <div className="space-y-4">
          {tasks.map((t: any) => {
            const start = new Date(t.orderDate).getTime();
            const end = new Date(t.deliveryDate || t.dueDate).getTime();
            const left = ((start - min) / total) * 100;
            const width = ((end - start) / total) * 100;
            return (
              <div key={t.id}>
                <div className="text-sm mb-1">{t.title}</div>
                <div className="relative h-4 bg-gray-200 rounded">
                  <div
                    className="absolute h-4 bg-blue-500 rounded"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}