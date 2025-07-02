import { useAuth } from '@/context/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  status?: number;
  error?: any;
}

interface ApiOptions<T = any> {
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (error: any) => void | Promise<void>;
  requireAuth?: boolean;
}

interface FetchOptions<T = any> extends ApiOptions<T> {
  dependencies?: any[];
  params?: any[];
  enabled?: boolean;
}

async function makeApiRequest<T = any>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  endpoint: string,
  body?: any,
  queryParams?: Record<string, string>,
  fetchWithAuth?: (url: string, options: RequestInit) => Promise<Response>,
  requireAuth: boolean = true,
): Promise<ApiResponse<T>> {
  try {
    let url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (queryParams) {
      const searchParams = new URLSearchParams(queryParams);
      url += `?${searchParams.toString()}`;
    }

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'get') {
      options.body = JSON.stringify(body);
    }

    const response =
      requireAuth && fetchWithAuth
        ? await fetchWithAuth(url, options)
        : await fetch(url, options);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data,
        status: response.status,
      };
    } else {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error' }));
      return {
        success: false,
        error: errorData,
        status: response.status,
      };
    }
  } catch (error: any) {
    if (error.message === 'Network request failed' || !navigator.onLine) {
      return {
        success: false,
        error: {
          status: 0,
          error: "You're offline. Please check your connection.",
        },
        status: 0,
      };
    }

    return {
      success: false,
      error: { message: error.message },
      status: 500,
    };
  }
}

export function useFetch<T>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  endpoint: string,
  options: FetchOptions<T> = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { user, fetchWithAuth } = useAuth();
  const {
    dependencies = [],
    params = [],
    enabled = true,
    requireAuth = true,
    onSuccess,
    onError,
  } = options;

  const isFetchingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);

  const fetchData = useCallback(
    async (isMounted = true, forceRefetch = false) => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      if (!forceRefetch && initialFetchDoneRef.current) {
        return;
      }

      if (isFetchingRef.current) {
        return;
      }

      if (requireAuth && !user?.id) {
        if (isMounted) {
          setData(null);
          setError(new Error('User not authenticated'));
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      isFetchingRef.current = true;

      try {
        const response = await makeApiRequest<T>(
          method,
          endpoint,
          undefined,
          undefined,
          fetchWithAuth,
          requireAuth,
        );

        if (isMounted) {
          if (response.success) {
            setData(response.data);
            setError(null);
            initialFetchDoneRef.current = true;

            if (onSuccess) {
              await onSuccess(response.data);
            }
          } else {
            setData(null);
            setError(response.error);

            if (onError) {
              await onError(response.error);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setData(null);
          setError(error);

          if (onError) {
            await onError(error);
          }
        }
      } finally {
        isFetchingRef.current = false;
        if (isMounted) {
          setLoading(false);
        }
      }
    },
    [
      endpoint,
      method,
      user,
      enabled,
      requireAuth,
      fetchWithAuth,
      onSuccess,
      onError,
      ...params,
      ...dependencies,
    ],
  );

  useEffect(() => {
    let isMounted = true;

    if (dependencies.length > 0) {
      initialFetchDoneRef.current = false;
    }

    fetchData(isMounted, false);

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const refetch = useCallback(async () => {
    return fetchData(true, true);
  }, [fetchData]);

  return { data, error, loading, refetch };
}

export function useAction<T>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  endpoint: string,
  options: ApiOptions<T> = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | undefined>(undefined);

  const { user, fetchWithAuth } = useAuth();
  const { requireAuth = true, onSuccess, onError } = options;

  const execute = useCallback(
    async (body?: any, queryParams?: Record<string, string>) => {
      if (requireAuth && !user?.id) {
        setError('User not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await makeApiRequest<T>(
          method,
          endpoint,
          body,
          queryParams,
          fetchWithAuth,
          requireAuth,
        );

        if (response.success) {
          setData(response.data);

          if (onSuccess) {
            await onSuccess(response.data);
          }

          return response.data;
        } else {
          setError(response.error);

          if (onError) {
            await onError(response.error);
          }

          return null;
        }
      } catch (error) {
        setError(error);

        if (onError) {
          await onError(error);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, user, requireAuth, fetchWithAuth, onSuccess, onError],
  );

  return { execute, loading, error, data };
}

