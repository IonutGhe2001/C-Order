import { useQuery } from '@tanstack/react-query';

const base = 'http://localhost:3001/api';

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const r = await fetch(`${base}/users/me`, { credentials: 'include' });
      if (r.status === 401) return null;
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    retry: false,
  });

  return { user: data, loading: isLoading };
}