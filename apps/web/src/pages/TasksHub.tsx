import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listTasks, updateTaskStatus } from '../lib/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

const statuses = ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED'];
const labels: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

function TaskCard({ task }: { task: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white p-2 rounded shadow mb-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <a href={`/tasks/${task.id}`} className="text-blue-600 hover:underline">
        {task.title}
      </a>
    </div>
  );
}

function Column({ id, tasks }: { id: string; tasks: any[] }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded min-h-[200px] flex-1">
      <h2 className="font-semibold mb-2">{labels[id]}</h2>
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  );
}

export default function TasksHub() {
  const { data, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => listTasks(),
  });

  const [columns, setColumns] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const grouped: Record<string, any[]> = statuses.reduce((acc, s) => ({ ...acc, [s]: [] }), {});
    data?.items?.forEach((t: any) => {
      if (grouped[t.status]) grouped[t.status].push(t);
    });
    setColumns(grouped);
  }, [data]);

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTaskStatus(id, status),
    onSuccess: () => refetch(),
  });

  const findStatus = (id: string) =>
    statuses.find((s) => columns[s]?.some((t: any) => t.id === id));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const from = findStatus(active.id);
    const to = over.id;
    if (!from || from === to) return;
    const task = columns[from].find((t: any) => t.id === active.id);
    setColumns((prev) => {
      const fromTasks = prev[from].filter((t: any) => t.id !== active.id);
      const toTasks = [...prev[to], { ...task, status: to }];
      return { ...prev, [from]: fromTasks, [to]: toTasks };
    });
    mutation.mutate({ id: active.id, status: to });
  };

  return (
    <>
      <Header />
      <Sidebar />
      <main className="pt-14 ml-60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Tasks</h1>
          <a href="/tasks/new" className="bg-blue-600 text-white px-4 py-2 rounded">
            + New Task
          </a>
        </div>
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-5 gap-4">
            {statuses.map((s) => (
              <Column key={s} id={s} tasks={columns[s] || []} />
            ))}
          </div>
        </DndContext>
      </main>
    </>
  );
}
