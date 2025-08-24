import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listTasks, updateTaskStatus, createTask, listUsers, listSuppliers } from '../lib/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ui/toaster';
import { motion } from 'framer-motion';
import { Icon } from '../lib/lucide-icon';

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
      <div className="flex items-center justify-between">
        <a href={`/tasks/${task.id}`} className="text-blue-600 hover:underline">
          {task.title}
        </a>
        <Badge variant={task.status.toLowerCase().replace('_','-')}>
          {labels[task.status]}
        </Badge>
      </div>
    </div>
  );
}

function Column({ id, tasks }: { id: string; tasks: any[] }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded min-h-[200px] flex-1">
      <h2 className="font-semibold mb-2">{labels[id]}</h2>
      {tasks.length === 0 ? (
        <div className="text-sm text-gray-500 flex items-center justify-center h-20">
          <Icon name="inbox" className="h-4 w-4 mr-1" /> No tasks
        </div>
      ) : (
        tasks.map((t) => <TaskCard key={t.id} task={t} />)
      )}
    </div>
  );
}

export default function TasksHub() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => listTasks(),
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [columns, setColumns] = useState<Record<string, any[]>>({});
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusVal, setStatusVal] = useState('OPEN');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [supplierInput, setSupplierInput] = useState('');
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    enabled: open,
  });
  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => listSuppliers(),
    enabled: open,
  });

  useEffect(() => {
    const grouped: Record<string, any[]> = statuses.reduce((acc, s) => ({ ...acc, [s]: [] }), {});
    data?.items?.forEach((t: any) => {
      if (grouped[t.status]) grouped[t.status].push(t);
    });
    setColumns(grouped);
  }, [data]);

  const toast = useToast();

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTaskStatus(id, status),
    onSuccess: () => refetch(),
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatusVal('OPEN');
    setPriority('MEDIUM');
    setAssignee('');
    setDueDate('');
    setSupplierInput('');
    setSupplierId(null);
    setBudget('');
    setCurrency('EUR');
    setErrors({});
  };

  const createMutation = useMutation({
    mutationFn: (payload: any) => createTask(payload),
    onSuccess: () => {
      refetch();
      resetForm();
      setOpen(false);
      toast({ title: 'Task created', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to create task', variant: 'error' }),
  });

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSupplierInput(val);
    const match = suppliersQuery.data?.items?.find((s: any) => s.name === val);
    setSupplierId(match ? match.id : null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!assignee) errs.assignee = 'Assignee is required';
    if (!dueDate) errs.dueDate = 'Due date is required';
    if (budget && isNaN(Number(budget))) errs.budget = 'Budget must be a number';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    createMutation.mutate({
      title,
      description,
      status: statusVal,
      priority,
      assigneeId: assignee,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      supplierId: supplierId || undefined,
      amount: budget ? Number(budget) : undefined,
      currency,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="pt-14 md:ml-60 ml-0 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Tasks</h1>
          <Button onClick={() => setOpen(true)}>
            + New Task
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-5 gap-4">
            {statuses.map((s) => (
              <div key={s} className="bg-gray-100 p-4 rounded min-h-[200px] flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 mb-2" />
                ))}
              </div>
            ))}
          </div>
          ) : isError ? (
          <div className="text-center text-red-600">
            Failed to load tasks.
            <Button variant="outline" className="ml-2" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-5 gap-4">
              {statuses.map((s) => (
                <Column key={s} id={s} tasks={columns[s] || []} />
              ))}
            </div>
          </DndContext>
        )}
      </motion.main>
      <Modal open={open} onClose={() => setOpen(false)} title="New Task">
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
            {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select className="mt-1 w-full border p-2" value={statusVal} onChange={(e) => setStatusVal(e.target.value)}>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {labels[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Priority</label>
              <select className="mt-1 w-full border p-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Assignee</label>
            {usersQuery.isLoading ? (
              <Skeleton className="h-10 w-full mt-1" />
            ) : usersQuery.isError ? (
              <div className="mt-1 text-red-600 text-sm flex items-center">
                Failed to load users
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => usersQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <select
                className="mt-1 w-full border p-2"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Select assignee</option>
                {usersQuery.data?.items?.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
            {errors.assignee && <p className="text-red-600 text-sm">{errors.assignee}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Due Date</label>
            <Input type="date" className="mt-1" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            {errors.dueDate && <p className="text-red-600 text-sm">{errors.dueDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Supplier</label>
            {suppliersQuery.isLoading ? (
              <Skeleton className="h-10 w-full mt-1" />
            ) : (
              <>
                <Input
                  list="suppliers"
                  className="mt-1"
                  value={supplierInput}
                  onChange={handleSupplierChange}
                />
                {!suppliersQuery.isError && (
                  <datalist id="suppliers">
                    {suppliersQuery.data?.items?.map((s: any) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                )}
                {suppliersQuery.isError && (
                  <div className="text-red-600 text-sm mt-1 flex items-center">
                    Failed to load suppliers
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => suppliersQuery.refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Budget</label>
              <Input type="number" className="mt-1" value={budget} onChange={(e) => setBudget(e.target.value)} />
              {errors.budget && <p className="text-red-600 text-sm">{errors.budget}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Currency</label>
              <select className="mt-1 w-full border p-2" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {['EUR', 'USD', 'GBP'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
