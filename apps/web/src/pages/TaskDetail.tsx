import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, addComment, getTaskAudit } from '../lib/api';
import { useState, useEffect, FormEvent } from 'react';

const statuses = ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED'];

export default function TaskDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: t } = useQuery({ queryKey: ['task', id], queryFn: () => getTask(id!) });
  const { data: audit } = useQuery({ queryKey: ['task', id, 'audit'], queryFn: () => getTaskAudit(id!) });

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

  if (!t) return null;

  return (
    <div className="p-6 space-y-4">
      <a href="/tasks" className="text-sm underline">← Back</a>
      <div className="flex items-center space-x-4">
        <input
          className="text-2xl font-semibold border-b focus:outline-none flex-1"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
        />
        <select value={status} onChange={e => changeStatus(e.target.value)} className="border p-1 rounded">
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-6">
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
            ) : <div className="text-sm text-gray-500">No supplier</div>}
          </div>
          <div>
            <h2 className="font-medium mb-2">Attachments</h2>
            <ul className="text-sm space-y-1 mb-2">
              {t.attachments?.map((a: any) => (
                <li key={a.id}><a className="underline" href={a.url}>{a.filename}</a></li>
              ))}
            </ul>
            <input type="file" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="font-medium mb-2">Comments</h2>
            <ul className="space-y-2 text-sm mb-2 max-h-64 overflow-auto">
              {t.comments?.map((c: any) => (
                <li key={c.id}><b>{c.author?.name ?? 'Anon'}</b>: {c.body}</li>
              ))}
            </ul>
            <form onSubmit={submitComment} className="flex space-x-2">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="flex-1 border rounded p-1 text-sm"
                placeholder="Add comment..."
              />
              <button type="submit" className="px-2 py-1 bg-blue-600 text-white text-sm rounded">Send</button>
            </form>
          </div>
          <div>
            <h2 className="font-medium mb-2">Audit Log</h2>
            <ul className="text-xs space-y-1 max-h-64 overflow-auto">
              {audit?.items?.map((a: any) => (
                <li key={a.id}>{a.user?.name || 'System'} {a.action} {new Date(a.createdAt).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
