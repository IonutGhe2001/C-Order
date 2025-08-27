import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTasks } from '../lib/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { NavLink } from 'react-router-dom';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

function ViewSwitcher() {
  const links = [
    { to: '/tasks', label: 'Listă' },
    { to: '/tasks/board', label: 'Board' },
    { to: '/tasks/calendar', label: 'Calendar' },
    { to: '/tasks/timeline', label: 'Timeline' },
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

export default function TasksCalendar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data } = useQuery({ queryKey: ['tasks'], queryFn: () => listTasks() });
  const events = (data?.items || []).flatMap((t: any) => {
    const arr: any[] = [];
    if (t.dueDate)
      arr.push({
        title: `${t.title} (Due)`,
        start: new Date(t.dueDate),
        end: new Date(t.dueDate),
      });
    if (t.orderReceivedDate)
      arr.push({
        title: `${t.title} (Order received)`,
        start: new Date(t.orderReceivedDate),
        end: new Date(t.orderReceivedDate),
      });
    return arr;
  });

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />
      <main className="pt-14 md:ml-60 ml-0 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Calendar</h1>
          <ViewSwitcher />
        </div>
        <Calendar
          localizer={localizer}
          events={events}
          style={{ height: 600 }}
          views={['month', 'week']}
          defaultView="month"
        />
      </main>
    </>
  );
}