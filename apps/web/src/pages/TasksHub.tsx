
import { useQuery } from '@tanstack/react-query';
import { listTasks } from '../lib/api';

export default function TasksHub(){
  const { data } = useQuery({ queryKey:['tasks'], queryFn: ()=>listTasks({}) });
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <ul className="mt-4 divide-y">
        {data?.items?.map((t:any)=> (
          <li key={t.id} className="py-3">
            <a href={`/tasks/${t.id}`} className="font-medium">{t.title}</a>
            <div className="text-sm opacity-70">{t.status} • {t.priority} • {t.supplier?.name ?? '—'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
