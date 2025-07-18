import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

interface UseApiDataOptions {
  requireAuth?: boolean;
  contentTypeId: string;
  endpoint?: 'list' | 'list-by-user';
  dependencies?: any[];
}

export const useApiData = <T = any>(options: UseApiDataOptions) => {
  const { requireAuth = true, contentTypeId, endpoint = 'list', dependencies = [] } = options;
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requireAuth && !token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (requireAuth && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/content/${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content_type_id: contentTypeId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.contents || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, contentTypeId, endpoint, requireAuth, ...dependencies]);

  return { data, loading, error, setData };
}; 