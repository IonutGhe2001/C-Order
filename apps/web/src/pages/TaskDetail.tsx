import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, addComment, getTaskAudit } from '../lib/api';
import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
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

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [desc, setDesc] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (t) {
      setTitle(t.title);
      setStatus(t.status);
      setDesc(t.description || '');
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
        <p className="text-red-600">Failed to load task.</p>
        <Button onClick={() => refetch()}>Retry</Button>
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
      <a href="/tasks" className="text-sm underline">← Back</a>
      <div className="flex items-center space-x-4">
        <Input
          className="text-2xl font-semibold border-b focus:outline-none flex-1"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
        />
        <select value={status} onChange={e => changeStatus(e.target.value)} className="border p-1 rounded">
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Badge
          variant={status
            .toLowerCase()
            .replace('_', '-') as 'open' | 'in-progress' | 'blocked' | 'done' | 'cancelled'}
        >
          {labels[status]}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-medium mb-2">Description</h2>
            <div
              contentEditable
              className="border rounded p-2 min-h-[150px]"
              dangerouslySetInnerHTML={{ __html: desc }}
              onInput={e => setDesc((e.target as HTMLElement).innerHTML)}
              onBlur={saveDesc}
            ></div>
          </div>
          <div>
            <h2 className="font-medium mb-2">Supplier</h2>
            {t.supplier ? (
              <div className="border rounded p-2 text-sm">
                <div className="font-medium">{t.supplier.name}</div>
                {t.supplier.email && <div>{t.supplier.email}</div>}
                {t.supplier.phone && <div>{t.supplier.phone}</div>}
              </div>
            ) : (
              <div className="text-sm text-gray-500 flex items-center">
                <Icon name="inbox" className="h-4 w-4 mr-1" /> No supplier
              </div>
            )}
          </div>
          <div>
            <h2 className="font-medium mb-2">Attachments</h2>
            {t.attachments?.length ? (
              <ul className="text-sm space-y-1 mb-2">
                {t.attachments.map((a: any) => (
                  <li key={a.id}><a className="underline" href={a.url}>{a.filename}</a></li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 flex items-center mb-2">
                <Icon name="inbox" className="h-4 w-4 mr-1" /> No attachments
              </div>
            )}
            <input type="file" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="font-medium mb-2">Comments</h2>
            {t.comments?.length ? (
              <ul className="space-y-2 text-sm mb-2 max-h-64 overflow-auto">
                {t.comments.map((c: any) => (
                  <li key={c.id}><b>{c.author?.name ?? 'Anon'}</b>: {c.body}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 flex items-center mb-2">
                <Icon name="inbox" className="h-4 w-4 mr-1" /> No comments
              </div>
            )}
            <form onSubmit={submitComment} className="flex space-x-2">
              <Input
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="flex-1 text-sm"
                placeholder="Add comment..."
              />
              <Button type="submit" className="px-2 py-1 text-sm">Send</Button>
            </form>
          </div>
          <div>
            <h2 className="font-medium mb-2">Audit Log</h2>
            {auditLoading ? (
              <Skeleton className="h-32" />
            ) : auditError ? (
              <div className="text-sm text-red-600 flex items-center">
                Failed to load audit log
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => refetchAudit()}
                >
                  Retry
                </Button>
              </div>
            ) : audit?.items?.length ? (
              <ul className="text-xs space-y-1 max-h-64 overflow-auto">
                {audit.items.map((a: any) => (
                  <li key={a.id}>{a.user?.name || 'System'} {a.action} {new Date(a.createdAt).toLocaleString()}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 flex items-center">
                <Icon name="inbox" className="h-4 w-4 mr-1" /> No audit entries
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
