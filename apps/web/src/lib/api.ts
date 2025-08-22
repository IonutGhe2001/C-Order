
const base = 'http://localhost:3001/api';

export async function login(email: string, password: string) {
  const r = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error('Auth failed');
  return r.json();
}

export async function listTasks(params: Record<string, any> = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null) as any).toString();
  const r = await fetch(`${base}/tasks?${qs}`, { credentials: 'include' });
  if (r.status === 401) throw new Error('Unauthorized');
  return r.json();
}

export async function getTask(id: string) {
  const r = await fetch(`${base}/tasks/${id}`, { credentials: 'include' });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function updateTaskStatus(id: string, status: string) {
  const r = await fetch(`${base}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function createTask(data: any) {
  const r = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function listUsers() {
  const r = await fetch(`${base}/users`, { credentials: 'include' });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function listSuppliers(q: string = '') {
  const r = await fetch(`${base}/suppliers?q=${encodeURIComponent(q)}`, { credentials: 'include' });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}
