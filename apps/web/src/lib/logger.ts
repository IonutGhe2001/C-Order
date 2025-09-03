import { base } from './api';

let userId: string | null = null;
const startTime = performance.now();

function sendLog(type: string, data: Record<string, any>) {
  const payload = { type, userId, timestamp: Date.now(), ...data };
  fetch(`${base}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export function setLoggerUser(id: string) {
  userId = id;
}

export function logError(error: Error) {
  sendLog('error', { message: error.message, stack: error.stack });
}

export function logLoad() {
  sendLog('load', { duration: performance.now() - startTime });
}

export function logPerformance(event: string, duration: number) {
  sendLog('performance', { event, duration });
}