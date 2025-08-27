const base = 'http://localhost:3001/api';

export interface TaskPayload {
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  assignees?: string[];
  supplierId?: string | null;
  dueDate?: string | null;
  amount?: number | null;
  currency?: string | null;
  orderDate?: string | null;
  orderReceivedDate?: string | null;
  orderNumber?: string | null;
  authority?: string | null;
  orderType?: string | null;
  productsReceivedDate?: string | null;
  deliveryDate?: string | null;
}

export interface TaskFilters {
  q?: string;
  status?: string;
  orderDate?: string;
  authority?: string;
}

export async function login(email: string, password: string) {
  const r = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error('Auth failed');
  return r.json();
}

export async function listTasks(params: TaskFilters = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '') as any,
  ).toString();
  const r = await fetch(`${base}/tasks?${qs}`, { credentials: 'include' });
  if (r.status === 401) throw new Error('Unauthorized');
  return r.json();
}

export async function getTask(id: string) {
  const r = await fetch(`${base}/tasks/${id}`, { credentials: 'include' });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function getTaskAudit(id: string) {
  const r = await fetch(`${base}/tasks/${id}/audit`, { credentials: 'include' });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function updateTask(id: string, data: Partial<TaskPayload>) {
  const r = await fetch(`${base}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export function updateTaskStatus(id: string, status: string) {
  return updateTask(id, { status });
}

export async function addComment(id: string, body: string) {
  const r = await fetch(`${base}/tasks/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ body }),
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function createTask(data: TaskPayload) {
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

export async function listVali(key: string) {
  const r = await fetch(`${base}/vali/${key}`, { credentials: 'include' });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}
