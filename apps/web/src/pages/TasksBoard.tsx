import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTasks, updateTaskStatus } from '../lib/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/tasks/TaskCard';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadStatuses, getStatusLabels } from '../lib/status-store';

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
            `px-3 py-1 rounded ${isActive ? 'bg-brand text-brand-fg' : 'bg-brand-muted text-gray-800'}`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </div>
  );
}


function DraggableTask({ task }: { task: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="mb-2">
      <TaskCard task={task} />
    </div>
  );
}

function StatusColumn({
  status,
  groups,
  labels,
}: {
  status: string;
  groups: Record<string, any[]>;
  labels: Record<string, string>;
}) {
  const { setNodeRef } = useDroppable({ id: status });
  const { t } = useTranslation();
  return (
    <div ref={setNodeRef} className="bg-brand-muted text-gray-800 rounded p-2 min-h-[200px]">
      <h2 className="font-medium text-sm mb-2">{t(labels[status] || `statuses.${status}`)}</h2>
      {Object.entries(groups).map(([orderType, list]) => (
        <div key={orderType} className="mb-4">
          <h3 className="text-xs font-semibold mb-1">{orderType}</h3>
          {list.map((t) => (
            <DraggableTask key={t.id} task={t} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function TasksBoard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [statuses, setStatuses] = useState<string[]>(loadStatuses());
  const labels = useMemo(() => getStatusLabels(), [statuses]);
  useEffect(() => {
    const handler = () => setStatuses(loadStatuses());
    window.addEventListener('statuses-updated', handler);
    return () => window.removeEventListener('statuses-updated', handler);
  }, []);
  const { data } = useQuery({ queryKey: ['tasks'], queryFn: () => listTasks() });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateTaskStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const grouped = useMemo(() => {
    const result: Record<string, Record<string, any[]>> = {};
    (data?.items || []).forEach((t: any) => {
      const st = t.status || 'OPEN';
      const ot = t.orderType || t('labels.noType');
      if (!result[st]) result[st] = {};
      if (!result[st][ot]) result[st][ot] = [];
      result[st][ot].push(t);
    });
    return result;
  }, [data]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.data.current?.status !== over.id) {
      mutation.mutate({ id: String(active.id), status: String(over.id) });
    }
  };

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main id="main-content" className="pt-14 md:ml-60 ml-0 p-6">
        <div className="flex items-center justify-between mb-4">
         <h1 className="text-xl font-bold">{t('nav.tasks')}</h1>
          <div className="flex items-center">
            <ViewSwitcher />
          </div>
        </div>
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {statuses.map((s) => (
              <StatusColumn key={s} status={s} labels={labels} groups={grouped[s] || {}} />
            ))}
          </div>
        </DndContext>
      </main>
    </>
  );
}