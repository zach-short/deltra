import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth';
import { CoveredCall } from '@/models';
import { api } from '@/utils/shared/api/api-client';

export interface CreateCoveredCallData {
  stock_id: string;
  strike_price: number;
  premium_received: number;
  contracts: number;
  expiration_date: string;
}

export interface UpdateCoveredCallData {
  strike_price?: number;
  premium_received?: number;
  contracts?: number;
  expiration_date?: string;
  status?: 'pending' | 'active' | 'expired' | 'assigned' | 'bought_back';
}

interface CoveredCallContextType {
  coveredCalls: CoveredCall[];
  loading: boolean;
  error: string | null;
  createCoveredCall: (
    data: CreateCoveredCallData,
  ) => Promise<CoveredCall | null>;
  updateCoveredCall: (
    callId: string,
    data: UpdateCoveredCallData,
  ) => Promise<CoveredCall | null>;
  deleteCoveredCall: (callId: string) => Promise<boolean>;
  getStockCoveredCalls: (stockId: string) => Promise<CoveredCall[]>;
  refreshCoveredCalls: () => Promise<void>;
  activateCoveredCall: (callId: string) => Promise<CoveredCall | null>;
}

const CoveredCallContext = createContext<CoveredCallContextType | null>(null);

const COVERED_CALLS_STORAGE_KEY = 'covered_calls';

export function CoveredCallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [coveredCalls, setCoveredCalls] = useState<CoveredCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storage =
    Platform.OS === 'web'
      ? {
          getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
          setItem: (key: string, value: string) =>
            Promise.resolve(localStorage.setItem(key, value)),
          removeItem: (key: string) =>
            Promise.resolve(localStorage.removeItem(key)),
        }
      : AsyncStorage;

  const saveCoveredCallsToStorage = useCallback(
    async (data: CoveredCall[]) => {
      if (user?.id) {
        try {
          await storage.setItem(
            `${COVERED_CALLS_STORAGE_KEY}_${user.id}`,
            JSON.stringify(data),
          );
        } catch (error) {
          console.warn('Failed to save covered calls to storage:', error);
        }
      }
    },
    [user?.id],
  );

  const loadCoveredCallsFromStorage = useCallback(async (): Promise<
    CoveredCall[]
  > => {
    if (!user?.id) return [];

    try {
      const data = await storage.getItem(
        `${COVERED_CALLS_STORAGE_KEY}_${user.id}`,
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Failed to load covered calls from storage:', error);
      return [];
    }
  }, [user?.id]);

  const refreshCoveredCalls = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.request('get', api.coveredCalls.getAll());

      if (!response.success) {
        throw new Error(
          response.error?.message || 'Failed to fetch covered calls',
        );
      }

      const callsData = response.data || [];
      setCoveredCalls(callsData);
      await saveCoveredCallsToStorage(callsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch covered calls';
      setError(errorMessage);
      console.error('Error fetching covered calls:', err);

      const storedCalls = await loadCoveredCallsFromStorage();
      setCoveredCalls(storedCalls);
    } finally {
      setLoading(false);
    }
  }, [user?.id, saveCoveredCallsToStorage, loadCoveredCallsFromStorage]);

  const createCoveredCall = useCallback(
    async (data: CreateCoveredCallData): Promise<CoveredCall | null> => {
      console.log('Creating covered call with data:', data);
      console.log('User object:', user);

      if (!user?.id) {
        console.error('No user ID found');
        return null;
      }

      const tempCall: CoveredCall = {
        id: `temp-${Date.now()}`,
        ...data,
        user_id: user.id,
        portfolio_id: '',
        status: 'active',
        total_premium: data.premium_received * data.contracts * 100,
        shares_covered: data.contracts * 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Adding temp covered call to state:', tempCall);
      setCoveredCalls((prev) => [tempCall, ...prev]);

      try {
        console.log('Making API request to create covered call');
        const response = await api.request(
          'post',
          api.coveredCalls.create(),
          data,
        );

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to create covered call',
          );
        }

        const newCall = response.data;
        console.log('Covered call created successfully:', newCall);
        setCoveredCalls((prev) => {
          const updatedCalls = prev.map((call) =>
            call.id === tempCall.id ? newCall : call,
          );
          saveCoveredCallsToStorage(updatedCalls);
          return updatedCalls;
        });
        return newCall;
      } catch (err) {
        console.error('Covered call creation failed:', err);
        setCoveredCalls((prev) =>
          prev.filter((call) => call.id !== tempCall.id),
        );

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create covered call';
        setError(errorMessage);
        console.error('Error creating covered call:', err);
        return null;
      }
    },
    [user?.id, saveCoveredCallsToStorage],
  );

  const updateCoveredCall = useCallback(
    async (
      callId: string,
      data: UpdateCoveredCallData,
    ): Promise<CoveredCall | null> => {
      if (!user?.id) return null;

      const originalCall = coveredCalls.find((call) => call.id === callId);
      if (!originalCall) return null;

      const optimisticCall = {
        ...originalCall,
        ...data,
        updated_at: new Date().toISOString(),
      };
      setCoveredCalls((prev) =>
        prev.map((call) => (call.id === callId ? optimisticCall : call)),
      );

      try {
        const response = await api.request(
          'patch',
          api.coveredCalls.update(callId),
          data,
        );

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to update covered call',
          );
        }

        const updatedCall = response.data;
        setCoveredCalls((prev) => {
          const updatedCalls = prev.map((call) =>
            call.id === callId ? updatedCall : call,
          );
          saveCoveredCallsToStorage(updatedCalls);
          return updatedCalls;
        });
        return updatedCall;
      } catch (err) {
        setCoveredCalls((prev) =>
          prev.map((call) => (call.id === callId ? originalCall : call)),
        );

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update covered call';
        setError(errorMessage);
        console.error('Error updating covered call:', err);
        return null;
      }
    },
    [user?.id, coveredCalls, saveCoveredCallsToStorage],
  );

  const deleteCoveredCall = useCallback(
    async (callId: string): Promise<boolean> => {
      if (!user?.id) return false;

      const originalCalls = coveredCalls;
      setCoveredCalls((prev) => prev.filter((call) => call.id !== callId));

      try {
        const response = await api.request(
          'delete',
          api.coveredCalls.delete(callId),
        );

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to delete covered call',
          );
        }

        saveCoveredCallsToStorage(
          coveredCalls.filter((call) => call.id !== callId),
        );
        return true;
      } catch (err) {
        setCoveredCalls(originalCalls);

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete covered call';
        setError(errorMessage);
        console.error('Error deleting covered call:', err);
        return false;
      }
    },
    [user?.id, coveredCalls, saveCoveredCallsToStorage],
  );

  const getStockCoveredCalls = useCallback(
    async (stockId: string): Promise<CoveredCall[]> => {
      if (!user?.id) return [];

      try {
        const response = await api.request(
          'get',
          api.coveredCalls.getForStock(stockId),
        );

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to fetch stock covered calls',
          );
        }

        return response.data || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to fetch stock covered calls';
        setError(errorMessage);
        console.error('Error fetching stock covered calls:', err);
        return [];
      }
    },
    [user?.id],
  );

  const activateCoveredCall = useCallback(
    async (callId: string): Promise<CoveredCall | null> => {
      if (!user?.id) return null;

      const originalCall = coveredCalls.find((call) => call.id === callId);
      if (!originalCall) return null;

      const optimisticCall = { ...originalCall, status: 'active' as const };
      setCoveredCalls((prev) =>
        prev.map((call) => (call.id === callId ? optimisticCall : call)),
      );

      try {
        const response = await api.request(
          'patch',
          api.coveredCalls.update(callId),
          { status: 'active' },
        );

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to activate covered call',
          );
        }

        const updatedCall = response.data;
        setCoveredCalls((prev) => {
          const updatedCalls = prev.map((call) =>
            call.id === callId ? updatedCall : call,
          );
          saveCoveredCallsToStorage(updatedCalls);
          return updatedCalls;
        });
        return updatedCall;
      } catch (err) {
        setCoveredCalls((prev) =>
          prev.map((call) => (call.id === callId ? originalCall : call)),
        );

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to activate covered call';
        setError(errorMessage);
        console.error('Error activating covered call:', err);
        return null;
      }
    },
    [user?.id, coveredCalls, saveCoveredCallsToStorage],
  );

  useEffect(() => {
    if (user?.id) {
      refreshCoveredCalls();
    } else {
      setCoveredCalls([]);
      setError(null);
    }
  }, [user?.id, refreshCoveredCalls]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (user?.id) {
        const storedCalls = await loadCoveredCallsFromStorage();
        if (storedCalls.length > 0) {
          setCoveredCalls(storedCalls);
        }
      }
    };

    loadInitialData();
  }, [user?.id, loadCoveredCallsFromStorage]);

  return (
    <CoveredCallContext.Provider
      value={{
        coveredCalls,
        loading,
        error,
        createCoveredCall,
        updateCoveredCall,
        deleteCoveredCall,
        getStockCoveredCalls,
        refreshCoveredCalls,
        activateCoveredCall,
      }}
    >
      {children}
    </CoveredCallContext.Provider>
  );
}

export function useCoveredCall() {
  const context = useContext(CoveredCallContext);
  if (context === null) {
    throw new Error('useCoveredCall must be used within a CoveredCallProvider');
  }
  return context;
}
