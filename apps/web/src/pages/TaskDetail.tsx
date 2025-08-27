import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, addComment, getTaskAudit, listUsers, listVali, TaskPayload } from '../lib/api';
import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { motion } from 'framer-motion';
import { Icon } from '../lib/lucide-icon';

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
const statusVariants: Record<string, any> = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  BLOCKED: 'blocked',
  DONE: 'done',
  LIVRAT_PARTIAL: 'in-progress',
  FINALIZAT: 'done',
  CANCELLED: 'cancelled',
};

export default function TaskDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const {
    data: t,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ['task', id], queryFn: () => getTask(id!) });
  const {
    data: audit,
    isLoading: auditLoading,
    isError: auditError,
    refetch: refetchAudit,
  } = useQuery({ queryKey: ['task', id, 'audit'], queryFn: () => getTaskAudit(id!) });

  const update = useMutation({
    mutationFn: (data: any) => updateTask(id!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', id] }),
  });

  const commentMut = useMutation({
    mutationFn: (body: string) => addComment(id!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', id] }),
  });

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: listUsers });
  const orderTypesQuery = useQuery({ queryKey: ['vali', 'orderType'], queryFn: () => listVali('orderType') });

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [desc, setDesc] = useState('');
  const [comment, setComment] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [orderDate, setOrderDate] = useState('');
  const [orderReceivedDate, setOrderReceivedDate] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [authority, setAuthority] = useState('');
  const [orderType, setOrderType] = useState('');
  const [productsReceivedDate, setProductsReceivedDate] = useState('');
  const [earlyDelivery, setEarlyDelivery] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    if (t) {
      setTitle(t.title);
      setStatus(t.status);
      setDesc(t.description || '');
      setAssignees(t.assignees?.map((a: any) => a.id) || []);
      setOrderDate(t.orderDate ? t.orderDate.slice(0, 10) : '');
      setOrderReceivedDate(t.orderReceivedDate ? t.orderReceivedDate.slice(0, 10) : '');
      setOrderNumber(t.orderNumber || '');
      setAuthority(t.authority || '');
      setOrderType(t.orderType || '');
      setProductsReceivedDate(t.productsReceivedDate ? t.productsReceivedDate.slice(0, 10) : '');
      setDeliveryDate(t.deliveryDate ? t.deliveryDate.slice(0, 10) : '');
      setEarlyDelivery(!!t.deliveryDate);
    }
  }, [t]);

  const saveTitle = () => {
    if (title !== t?.title) update.mutate({ title });
  };
  const saveDesc = () => {
    if (desc !== t?.description) update.mutate({ description: desc });
  };
  const changeStatus = (s: string) => {
    setStatus(s);
    update.mutate({ status: s });
  };
  const save = (data: Partial<TaskPayload>) => update.mutate(data);
  const submitComment = (e: FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      commentMut.mutate(comment.trim());
      setComment('');
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="p-6 space-y-4"
      >
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[150px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (isError || !t) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="p-6 text-center space-y-4"
      >
        <p className="text-red-600">Încărcarea task-ului a eșuat.</p>
        <Button onClick={() => refetch()}>Reîncearcă</Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-4"
    >
      <a href="/tasks" className="text-sm underline">← Înapoi</a>
      <div className="flex items-center space-x-4">
        <Input
          className="text-2xl font-semibold border-b focus:outline-none flex-1"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
        />
        <select value={status} onChange={e => changeStatus(e.target.value)} className="border p-1 rounded">
          {statuses.map(s => <option key={s} value={s}>{labels[s]}</option>)}
        </select>
        <Badge variant={statusVariants[status]}>
          {labels[status]}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Responsabili</label>
          {usersQuery.isLoading ? (
            <Skeleton className="h-10 w-full mt-1" />
          ) : usersQuery.isError ? (
            <div className="mt-1 text-red-600 text-sm">Încărcarea utilizatorilor a eșuat</div>
          ) : (
            <select
              multiple
              className="mt-1 w-full border p-2 h-32"
              value={assignees}
              onChange={(e) => {
                const vals = Array.from(e.target.selectedOptions, (o) => o.value);
                setAssignees(vals);
                save({ assignees: vals });
              }}
            >
              {usersQuery.data?.items?.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Data comandă</label>
          <Input
            type="date"
            className="mt-1"
            value={orderDate}
            onChange={e => setOrderDate(e.target.value)}
            onBlur={() => save({ orderDate: orderDate ? new Date(orderDate).toISOString() : null })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Data primire comandă</label>
          <Input
            type="date"
            className="mt-1"
            value={orderReceivedDate}
            onChange={e => setOrderReceivedDate(e.target.value)}
            onBlur={() => save({ orderReceivedDate: orderReceivedDate ? new Date(orderReceivedDate).toISOString() : null })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Număr comandă</label>
          <Input
            className="mt-1"
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
            onBlur={() => save({ orderNumber: orderNumber || null })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Autoritate</label>
          <Input
            className="mt-1"
            value={authority}
            onChange={e => setAuthority(e.target.value)}
            onBlur={() => save({ authority: authority || null })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tip comandă</label>
          {orderTypesQuery.isLoading ? (
            <Skeleton className="h-10 w-full mt-1" />
          ) : orderTypesQuery.isError ? (
            <div className="mt-1 text-red-600 text-sm">Încărcarea tipurilor a eșuat</div>
          ) : (
            <select
              className="mt-1 w-full border p-2"
              value={orderType}
              onChange={(e) => {
                setOrderType(e.target.value);
                save({ orderType: e.target.value || null });
              }}
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
          <label className="block text-sm font-medium">Data primire produse</label>
          <Input
            type="date"
            className="mt-1"
            value={productsReceivedDate}
            onChange={e => setProductsReceivedDate(e.target.value)}
            onBlur={() => save({ productsReceivedDate: productsReceivedDate ? new Date(productsReceivedDate).toISOString() : null })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="inline-flex items-center text-sm font-medium">
            <input
              type="checkbox"
              className="mr-2"
              checked={earlyDelivery}
              onChange={e => {
                setEarlyDelivery(e.target.checked);
                if (!e.target.checked) {
                  setDeliveryDate('');
                  save({ deliveryDate: null });
                }
              }}
            />
            Livrare mai devreme
          </label>
          {earlyDelivery && (
            <Input
              type="date"
              className="mt-1"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              onBlur={() => save({ deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null })}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-medium mb-2">Descriere</h2>
            <div
              contentEditable
              className="border rounded p-2 min-h-[150px]"
              dangerouslySetInnerHTML={{ __html: desc }}
              onInput={e => setDesc((e.target as HTMLElement).innerHTML)}
              onBlur={saveDesc}
            ></div>
          </div>
          <div>
            <h2 className="font-medium mb-2">Fișiere</h2>
            {t.attachments?.length ? (
              <ul className="text-sm space-y-1 mb-2">
                {t.attachments.map((a: any) => (
                  <li key={a.id}><a className="underline" href={a.url}>{a.filename}</a></li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 flex items-center mb-2">
                <Icon name="inbox" className="h-4 w-4 mr-1" /> Niciun fișier
              </div>
            )}
            <input type="file" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="font-medium mb-2">Comentarii</h2>
            {t.comments?.length ? (
              <ul className="space-y-2 text-sm mb-2 max-h-64 overflow-auto">
                {t.comments.map((c: any) => (
                  <li key={c.id}><b>{c.author?.name ?? 'Anonim'}</b>: {c.body}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 flex items-center mb-2">
                <Icon name="inbox" className="h-4 w-4 mr-1" /> Niciun comentariu
              </div>
            )}
            <form onSubmit={submitComment} className="flex space-x-2">
              <Input
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="flex-1 text-sm"
                placeholder="Adaugă comentariu..."
              />
              <Button type="submit" className="px-2 py-1 text-sm">Trimite</Button>
            </form>
          </div>
          <div>
            <h2 className="font-medium mb-2">Jurnal audit</h2>
            {auditLoading ? (
              <Skeleton className="h-32" />
            ) : auditError ? (
              <div className="text-sm text-red-600 flex items-center">
                Încărcarea jurnalului de audit a eșuat
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => refetchAudit()}
                >
                  Reîncearcă
                </Button>
              </div>
            ) : audit?.items?.length ? (
              <ul className="text-xs space-y-1 max-h-64 overflow-auto">
                {audit.items.map((a: any) => (
                  <li key={a.id}>{a.user?.name || 'Sistemul'} {a.action} {new Date(a.createdAt).toLocaleString()}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 flex items-center">
                <Icon name="inbox" className="h-4 w-4 mr-1" /> Nicio intrare în jurnal
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
