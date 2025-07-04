import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth';
import { Stock } from '@/models';
import { api } from '@/utils/shared/api/api-client';
import { CreateCoveredCallData } from './covered-call';

interface StockContextType {
  currentStock: Stock | null;
  loading: boolean;
  error: string | null;
  loadStock: (stockId: string) => Promise<void>;
  refreshStock: () => Promise<void>;
  createCoveredCall: (data: CreateCoveredCallData) => Promise<void>;
  creatingCoveredCall: boolean;
}

const StockContext = createContext<StockContextType | null>(null);

const STOCK_STORAGE_KEY = 'current_stock';

export function StockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentStock, setCurrentStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingCoveredCall, setCreatingCoveredCall] = useState(false);

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

  const saveStockToStorage = useCallback(
    async (stock: Stock) => {
      if (user?.id) {
        try {
          await storage.setItem(
            `${STOCK_STORAGE_KEY}_${user.id}`,
            JSON.stringify(stock),
          );
        } catch (error) {
          console.warn(error);
        }
      }
    },
    [user?.id],
  );

  const loadStockFromStorage = useCallback(async (): Promise<Stock | null> => {
    if (!user?.id) return null;

    try {
      const data = await storage.getItem(`${STOCK_STORAGE_KEY}_${user.id}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }, [user?.id]);

  const loadStock = useCallback(
    async (stockId: string) => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await api.request('get', api.stocks.getById(stockId));

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch stock');
        }

        const stockData = response.data;
        setCurrentStock(stockData);
        await saveStockToStorage(stockData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch stock';
        setError(errorMessage);

        const storedStock = await loadStockFromStorage();
        if (storedStock) {
          setCurrentStock(storedStock);
        } else {
          Alert.alert('Error', 'Failed to load stock data', [
            {
              text: 'OK',
              onPress: () => {
                throw new Error('NAVIGATE_BACK');
              },
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    },
    [user?.id, saveStockToStorage, loadStockFromStorage],
  );

  const refreshStock = useCallback(async () => {
    if (currentStock?.id) {
      await loadStock(currentStock.id);
    }
  }, [currentStock?.id, loadStock]);

  const createCoveredCall = useCallback(
    async (data: CreateCoveredCallData) => {
      if (!user?.id || !currentStock) {
        throw new Error('User not authenticated or no stock selected');
      }

      setCreatingCoveredCall(true);
      setError(null);

      try {
        const response = await api.request('post', api.coveredCalls.create(), {
          ...data,
          stock_id: currentStock.id,
        });

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to create covered call',
          );
        }

        await refreshStock();

        Alert.alert('Success', 'Covered call created successfully');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create covered call';
        setError(errorMessage);
        Alert.alert('Error', 'Failed to create covered call');
        throw err;
      } finally {
        setCreatingCoveredCall(false);
      }
    },
    [user?.id, currentStock, refreshStock],
  );

  useEffect(() => {
    if (!user?.id) {
      setCurrentStock(null);
      setError(null);
      setLoading(false);
    }
  }, [user?.id]);

  const value: StockContextType = {
    currentStock,
    loading,
    error,
    loadStock,
    refreshStock,
    createCoveredCall,
    creatingCoveredCall,
  };

  return (
    <StockContext.Provider value={value}>{children}</StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === null) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}

