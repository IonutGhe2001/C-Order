const KEY = 'task-statuses';
const defaultStatuses = ['OPEN', 'IN_PROGRESS', 'LIVRAT_PARTIAL', 'FINALIZAT'];

export function loadStatuses(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    /* ignore */
  }
  return [...defaultStatuses];
}

export function saveStatuses(statuses: string[]) {
  localStorage.setItem(KEY, JSON.stringify(statuses));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('statuses-updated'));
  }
}

export function addStatus(name: string) {
  const statuses = loadStatuses();
  if (!statuses.includes(name)) {
    statuses.push(name);
    saveStatuses(statuses);
  }
  return statuses;
}

export function updateStatus(oldName: string, newName: string) {
  const statuses = loadStatuses().map((s) => (s === oldName ? newName : s));
  saveStatuses(statuses);
  return statuses;
}

export function removeStatus(name: string) {
  const statuses = loadStatuses().filter((s) => s !== name);
  saveStatuses(statuses);
  return statuses;
}

export function getStatusLabels(): Record<string, string> {
  return Object.fromEntries(loadStatuses().map((s) => [s, `statuses.${s}`]));
}