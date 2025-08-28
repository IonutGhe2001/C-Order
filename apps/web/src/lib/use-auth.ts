import { useQuery } from '@tanstack/react-query';
import { base, fetchWithAuth } from './api';

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const r = await fetchWithAuth(`${base}/users/me`);
      if (r.status === 401) return null;
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    retry: false,
  });

  return { user: data, loading: isLoading };
}