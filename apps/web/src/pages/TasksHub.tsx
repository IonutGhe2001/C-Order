import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listTasks, createTask, listUsers, listVali, TaskPayload } from '../lib/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ui/toaster';
import { getStatusColor } from '../lib/status-colors';
import { motion } from 'framer-motion';

const statuses = [
  'OPEN',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE',
  'LIVRAT_PARTIAL',
  'FINALIZAT',
  'CANCELLED',
];
const labels: Record<string, string> = {
  OPEN: 'Deschis',
  IN_PROGRESS: 'În progres',
  BLOCKED: 'Blocat',
  DONE: 'Finalizat',
  LIVRAT_PARTIAL: 'Livrat parțial',
  FINALIZAT: 'Finalizat',
  CANCELLED: 'Anulat',
};

export default function TasksHub() {
  const [filters, setFilters] = useState({ q: '', orderDate: '', authority: '', status: '' });
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => listTasks(filters),
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusVal, setStatusVal] = useState('IN_PROGRESS');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderReceivedDate, setOrderReceivedDate] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [authority, setAuthority] = useState('');
  const [orderType, setOrderType] = useState('');
  const [productsReceivedDate, setProductsReceivedDate] = useState('');
  const [earlyDelivery, setEarlyDelivery] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    enabled: open,
  });

  const orderTypesQuery = useQuery({
    queryKey: ['vali', 'orderType'],
    queryFn: () => listVali('orderType'),
    enabled: open,
  });

  const toast = useToast();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatusVal('IN_PROGRESS');
    setPriority('MEDIUM');
    setAssignees([]);
    setDueDate('');
    setOrderDate('');
    setOrderReceivedDate('');
    setOrderNumber('');
    setAuthority('');
    setOrderType('');
    setProductsReceivedDate('');
    setEarlyDelivery(false);
    setDeliveryDate('');
    setErrors({});
  };

  const createMutation = useMutation({
    mutationFn: (payload: any) => createTask(payload),
    onSuccess: () => {
      refetch();
      resetForm();
      setOpen(false);
      toast({ title: 'Task creat', variant: 'success' });
    },
    onError: () => toast({ title: 'Crearea task-ului a eșuat', variant: 'error' }),
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Titlul este obligatoriu';
    if (!assignees.length) errs.assignees = 'Responsabilul este obligatoriu';
    if (!dueDate) errs.dueDate = 'Data limită este obligatorie';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload: TaskPayload = {
      title,
      description,
      status: statusVal,
      priority,
      assignees,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    orderDate: orderDate ? new Date(orderDate).toISOString() : undefined,
      orderReceivedDate: orderReceivedDate ? new Date(orderReceivedDate).toISOString() : undefined,
      orderNumber: orderNumber || undefined,
      authority: authority || undefined,
      orderType: orderType || undefined,
      productsReceivedDate: productsReceivedDate ? new Date(productsReceivedDate).toISOString() : undefined,
      ...(earlyDelivery && deliveryDate
        ? { deliveryDate: new Date(deliveryDate).toISOString() }
        : {}),
    };

    createMutation.mutate(payload);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
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
          <h1 className="text-xl font-bold">Task-uri</h1>
          <Button onClick={() => setOpen(true)}>+ Task nou</Button>
        </div>
        <div className="flex flex-wrap items-end gap-2 mb-4">
          <Input
            placeholder="Caută"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="w-40"
          />
          <Input
            placeholder="Autoritate"
            value={filters.authority}
            onChange={(e) => setFilters({ ...filters, authority: e.target.value })}
            className="w-40"
          />
          <Input
            type="date"
            value={filters.orderDate}
            onChange={(e) => setFilters({ ...filters, orderDate: e.target.value })}
            className="w-40"
          />
          <select
            className="border p-2 rounded"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {labels[s]}
              </option>
            ))}
          </select>
        </div>
        {isLoading ? (
          <table className="min-w-full border">
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2"><Skeleton className="h-4 w-40" /></td>
                  <td className="p-2"><Skeleton className="h-4 w-32" /></td>
                  <td className="p-2"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-2" />
                </tr>
              ))}
            </tbody>
          </table>
        ) : isError ? (
          <div className="text-center text-red-600">
            Încărcarea task-urilor a eșuat.
            <Button variant="outline" className="ml-2" onClick={() => refetch()}>Reîncearcă</Button>
          </div>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 border-r">Nume task</th>
                <th className="text-left p-2 border-r">Creator</th>
                <th className="text-left p-2 border-r">Status</th>
                <th className="text-left p-2">Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.length ? data.items.map((task: any) => (
                <tr key={task.id} className="border-t">
                  <td className="p-2">{task.title}</td>
                  <td className="p-2">{task.owner?.name || '-'}</td>
                  <td className="p-2">
                    <Badge variant={getStatusColor(task.status)}>
                      {labels[task.status]}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <a href={`/tasks/${task.id}`} className="text-blue-600 underline">Deschide</a>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-sm text-gray-500">Niciun task</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.main>
      <Modal open={open} onClose={() => setOpen(false)} title="Task nou">
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Titlu</label>
            <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
            {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Descriere</label>
            <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium">Prioritate</label>
              <select className="mt-1 w-full border p-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {[
                  { value: 'LOW', label: 'Scăzută' },
                  { value: 'MEDIUM', label: 'Medie' },
                  { value: 'HIGH', label: 'Ridicată' },
                  { value: 'URGENT', label: 'Urgentă' }
                ].map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Responsabili</label>
            {usersQuery.isLoading ? (
              <Skeleton className="h-10 w-full mt-1" />
            ) : usersQuery.isError ? (
              <div className="mt-1 text-red-600 text-sm flex items-center">
                Încărcarea utilizatorilor a eșuat
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => usersQuery.refetch()}
                >
                  Reîncearcă
                </Button>
              </div>
            ) : (
              <select
                multiple
                className="mt-1 w-full border p-2 h-32"
                value={assignees}
                onChange={(e) =>
                  setAssignees(Array.from(e.target.selectedOptions, (o) => o.value))
                }
              >
                <option value="">Selectează responsabil</option>
                {usersQuery.data?.items?.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
            {errors.assignees && <p className="text-red-600 text-sm">{errors.assignees}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Data limită</label>
            <Input type="date" className="mt-1" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            {errors.dueDate && <p className="text-red-600 text-sm">{errors.dueDate}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Data comandă</label>
              <Input type="date" className="mt-1" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Număr comandă</label>
              <Input className="mt-1" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Autoritate</label>
              <Input className="mt-1" value={authority} onChange={(e) => setAuthority(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Tip comandă</label>
              {orderTypesQuery.isLoading ? (
                <Skeleton className="h-10 w-full mt-1" />
              ) : orderTypesQuery.isError ? (
                <div className="mt-1 text-red-600 text-sm flex items-center">
                  Încărcarea tipurilor a eșuat
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => orderTypesQuery.refetch()}
                  >
                    Reîncearcă
                  </Button>
                </div>
              ) : (
                <select
                  className="mt-1 w-full border p-2"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="">Selectează tip</option>
                  {orderTypesQuery.data?.items?.map((o: any) => (
                    <option key={o.id || o.value} value={o.value || o.id}>
                      {o.label || o.name || o.value}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Data primire comandă</label>
              <Input
                type="date"
                className="mt-1"
                value={orderReceivedDate}
                onChange={(e) => setOrderReceivedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Data primire produse</label>
              <Input
                type="date"
                className="mt-1"
                value={productsReceivedDate}
                onChange={(e) => setProductsReceivedDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center text-sm font-medium">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={earlyDelivery}
                  onChange={(e) => {
                    setEarlyDelivery(e.target.checked);
                    if (!e.target.checked) setDeliveryDate('');
                  }}
                />
                Livrare mai devreme
              </label>
              {earlyDelivery && (
                <Input
                  type="date"
                  className="mt-1"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              )}
            </div>
          </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit">Salvează</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
