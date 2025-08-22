
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTask } from '../lib/api';

export default function TaskDetail(){
  const { id } = useParams();
  const { data: t } = useQuery({ queryKey:['task', id], queryFn: ()=>getTask(id!) });
  if (!t) return null;
  return (
    <div className="p-6 space-y-4">
      <a href="/tasks" className="text-sm underline">← Back</a>
      <h1 className="text-2xl font-semibold">{t.title}</h1>
      <div className="text-sm">Status: {t.status} • Priority: {t.priority} • Due: {t.dueDate?.slice(0,10) ?? '—'}</div>
      <p className="whitespace-pre-wrap">{t.description}</p>
      <section>
        <h2 className="font-medium">Comments</h2>
        <ul className="mt-2 space-y-2">
          {t.comments?.map((c:any)=>(
            <li key={c.id} className="text-sm"><b>{c.author?.name ?? 'Anon'}</b>: {c.body}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
