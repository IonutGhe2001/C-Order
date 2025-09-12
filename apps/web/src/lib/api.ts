export const base = 'http://localhost:3001/api';

// Root URL of the API without the `/api` prefix
export const apiRoot = base.replace(/\/api$/, '');

// Convert a relative file path returned by the API into a fully-qualified URL
export function getFileUrl(url: string) {
  return url.startsWith('http') ? url : `${apiRoot}${url}`;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  retry = true,
) {
  const res = await fetch(url, { ...options, credentials: 'include' });
  if (res.status === 401 && retry) {
    const refresh = await fetch(`${base}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refresh.ok) return fetchWithAuth(url, options, false);
  }
  return res;
}

export interface TaskPayload {
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  assignees?: string[];
  supplier?: string | null;
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
  custom?: Record<string, string>;
}

export interface TaskFilters {
  q?: string;
  status?: string | string[];
  assignees?: string | string[];
  from?: string;
  to?: string;
  priority?: string;
  orderDate?: string;
  authority?: string;
}

interface Kpi {
  title: string;
  value: number;
  trend: number[];
  delta?: number;
  icon?: string;
  href?: string;
}

export async function login(email: string, password: string) {
  const r = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error('Auth failed');
  return r.json();
}

export async function logout() {
  await fetchWithAuth(`${base}/auth/logout`, { method: 'POST' });
}

export async function listTasks(params: TaskFilters = {}) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) =>
        Array.isArray(v) ? v.length > 0 : v != null && v !== '',
      )
      .flatMap(([k, v]) =>
        Array.isArray(v) ? [[k, v.join(',')]] : [[k, v as string]],
      ) as any,
  ).toString();
  const r = await fetchWithAuth(`${base}/tasks?${qs}`);
  if (r.status === 401) throw new Error('Unauthorized');
  return r.json();
}

export async function getTask(id: string) {
  const r = await fetchWithAuth(`${base}/tasks/${id}`);
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function getTaskAudit(id: string) {
  const r = await fetchWithAuth(`${base}/tasks/${id}/audit`);
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function updateTask(id: string, data: Partial<TaskPayload>) {
  const r = await fetchWithAuth(`${base}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export function updateTaskStatus(id: string, status: string) {
  return updateTask(id, { status });
}

export async function addComment(id: string, body: string) {
  const r = await fetchWithAuth(`${base}/tasks/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function updateAttachment(
  taskId: string,
  attId: string,
  file: File,
) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetchWithAuth(`${base}/tasks/${taskId}/attachments/${attId}`, {
    method: 'PATCH',
    body: fd,
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function deleteAttachment(taskId: string, attId: string) {
  const r = await fetchWithAuth(`${base}/tasks/${taskId}/attachments/${attId}`, {
    method: 'DELETE',
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function deleteTask(id: string) {
  const r = await fetchWithAuth(`${base}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function archiveTask(id: string) {
  const r = await fetchWithAuth(`${base}/tasks/${id}/archive`, {
    method: 'POST',
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function createTask(data: TaskPayload) {
  const r = await fetchWithAuth(`${base}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function listCustomFields() {
  const r = await fetchWithAuth(`${base}/custom-fields`);
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function listUsers() {
  const r = await fetchWithAuth(`${base}/users`);
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function listSuppliers(q: string = '') {
  const url = q ? `${base}/suppliers?q=${encodeURIComponent(q)}` : `${base}/suppliers`;
  const r = await fetchWithAuth(url);
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function getSupplier(id: string) {
  const r = await fetchWithAuth(`${base}/suppliers/${id}`);
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function getTaskSummary(rangeOrCtx?: string | { queryKey: any }): Promise<Kpi[]> {
  const range = typeof rangeOrCtx === 'string' ? rangeOrCtx : undefined;
  const qs = range ? `?range=${encodeURIComponent(range)}` : '';
  const r = await fetchWithAuth(`${base}/tasks/summary${qs}`);
  if (!r.ok) throw new Error('Failed');
  return r.json();
}
