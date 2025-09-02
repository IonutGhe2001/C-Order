import { base } from './api';

let userId: string | null = null;

export function setAnalyticsUser(id: string) {
  userId = id;
}

export function trackEvent(event: string, data: Record<string, any> = {}) {
  const payload = { event, userId, data, timestamp: Date.now() };
  fetch(`${base}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}