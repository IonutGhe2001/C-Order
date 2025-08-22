import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTasks } from '../lib/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function TasksHub(){
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const { data } = useQuery({
    queryKey: ['tasks', status, q],
    queryFn: () => listTasks({ status: status || undefined, q: q || undefined })
  });

  return (
    <>
      <Header />
      <Sidebar />
      <main className="pt-14 ml-60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="DONE">Done</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <a href="/tasks/new" className="bg-blue-600 text-white px-4 py-2 rounded">
            + New Task
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left bg-gray-100">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Assignee</th>
                <th className="px-3 py-2">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items?.map((t: any) => (
                <tr key={t.id}>
                  <td className="px-3 py-2">
                    <a href={`/tasks/${t.id}`} className="text-blue-600 hover:underline">
                      {t.title}
                    </a>
                  </td>
                  <td className="px-3 py-2">{t.status}</td>
                  <td className="px-3 py-2">{t.priority}</td>
                  <td className="px-3 py-2">
                    {t.assignees?.map((a: any) => a.name).join(', ') || '—'}
                  </td>
                  <td className="px-3 py-2">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
