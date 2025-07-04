import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth';
import { Portfolio } from '@/models';
import { api } from '@/utils/shared/api/api-client';

interface Stock {
  id: string;
  symbol: string;
  shares: number;
  basis: number;
  portfolio_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface PortfolioContextType {
  portfolios: Portfolio[];
  loading: boolean;
  error: string | null;
  refreshPortfolios: () => Promise<void>;
  createPortfolio: (name: string) => Promise<Portfolio | null>;
  updatePortfolio: (
    portfolioId: string,
    name: string,
  ) => Promise<Portfolio | null>;
  deletePortfolio: (portfolioId: string) => Promise<boolean>;
  createStock: (data: {
    symbol: string;
    shares: number;
    basis: number;
    portfolio_id: string;
  }) => Promise<Stock | null>;
  updateStock: (stockId: string, data: Partial<Stock>) => Promise<Stock | null>;
  deleteStock: (stockId: string) => Promise<boolean>;
  getPortfolioByStockId: (stockId: string) => Portfolio | null;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

const PORTFOLIOS_STORAGE_KEY = 'portfolios_data';

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    } else {
      return AsyncStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {}
    } else {
      return AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {}
    } else {
      return AsyncStorage.removeItem(key);
    }
  },
};

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const savePortfoliosToStorage = useCallback(
    async (data: Portfolio[]) => {
      if (user?.id) {
        try {
          await storage.setItem(
            `${PORTFOLIOS_STORAGE_KEY}_${user.id}`,
            JSON.stringify(data),
          );
        } catch (error) {
          console.warn(error);
        }
      }
    },
    [user?.id],
  );

  const getPortfolioByStockId = useCallback(
    (stockId: string): Portfolio | null => {
      for (const portfolio of portfolios) {
        if (portfolio.stocks?.some((stock) => stock.id === stockId)) {
          return portfolio;
        }
      }
      return null;
    },
    [portfolios],
  );

  const loadPortfoliosFromStorage = useCallback(async (): Promise<
    Portfolio[]
  > => {
    if (!user?.id) return [];

    try {
      const data = await storage.getItem(
        `${PORTFOLIOS_STORAGE_KEY}_${user.id}`,
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn(error);
      return [];
    }
  }, [user?.id]);

  const clearPortfoliosFromStorage = useCallback(async () => {
    if (user?.id) {
      try {
        await storage.removeItem(`${PORTFOLIOS_STORAGE_KEY}_${user.id}`);
      } catch (error) {
        console.warn(error);
      }
    }
  }, [user?.id]);

  const refreshPortfolios = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.request('get', api.portfolios.getAll());

      if (!response.success) {
        throw new Error(
          response.error?.message || 'Failed to fetch portfolios',
        );
      }

      const portfoliosData = response.data || [];
      setPortfolios(portfoliosData);
      await savePortfoliosToStorage(portfoliosData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch portfolios';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, savePortfoliosToStorage]);

  const createPortfolio = useCallback(
    async (name: string): Promise<Portfolio | null> => {
      if (!user?.id) {
        return null;
      }

      const tempPortfolio: Portfolio = {
        id: `temp-${Date.now()}`,
        name,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stocks: [],
      };

      setPortfolios((prev) => [...prev, tempPortfolio]);

      try {
        const response = await api.request('post', api.portfolios.create(), {
          name,
        });

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to create portfolio',
          );
        }

        const newPortfolio = response.data;

        setPortfolios((prev) => {
          const updatedPortfolios = prev.map((p) =>
            p.id === tempPortfolio.id
              ? { ...newPortfolio, stocks: p.stocks || [] }
              : p,
          );
          savePortfoliosToStorage(updatedPortfolios);
          return updatedPortfolios;
        });
        return newPortfolio;
      } catch (err) {
        setPortfolios((prev) => prev.filter((p) => p.id !== tempPortfolio.id));

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create portfolio';
        setError(errorMessage);
        return null;
      }
    },
    [user?.id, portfolios, savePortfoliosToStorage],
  );

  const updatePortfolio = useCallback(
    async (portfolioId: string, name: string): Promise<Portfolio | null> => {
      if (!user?.id) return null;

      const originalPortfolio = portfolios.find((p) => p.id === portfolioId);
      if (!originalPortfolio) return null;

      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === portfolioId
            ? { ...p, name, updated_at: new Date().toISOString() }
            : p,
        ),
      );

      try {
        const response = await api.request(
          'patch',
          api.portfolios.update(portfolioId),
          { name },
        );

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to update portfolio',
          );
        }

        const updatedPortfolio = response.data;

        setPortfolios((prev) =>
          prev.map((p) =>
            p.id === portfolioId
              ? { ...p, ...updatedPortfolio, stocks: p.stocks }
              : p,
          ),
        );
        return updatedPortfolio;
      } catch (err) {
        setPortfolios((prev) =>
          prev.map((p) => (p.id === portfolioId ? originalPortfolio : p)),
        );

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update portfolio';
        setError(errorMessage);
        return null;
      }
    },
    [user?.id, portfolios],
  );

  const deletePortfolio = useCallback(
    async (portfolioId: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const response = await api.request(
          'delete',
          api.portfolios.delete(portfolioId),
        );

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to delete portfolio',
          );
        }

        setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete portfolio';
        setError(errorMessage);
        return false;
      }
    },
    [user?.id],
  );

  const createStock = useCallback(
    async (data: {
      symbol: string;
      shares: number;
      basis: number;
      portfolio_id: string;
    }): Promise<Stock | null> => {
      if (!user?.id) return null;

      const tempStock: Stock = {
        id: `temp-${Date.now()}`,
        symbol: data.symbol,
        shares: data.shares,
        basis: data.basis,
        portfolio_id: data.portfolio_id,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setPortfolios((prev) =>
        prev.map((portfolio) => {
          if (portfolio.id === data.portfolio_id) {
            return {
              ...portfolio,
              stocks: [...(portfolio.stocks || []), tempStock],
            };
          }
          return portfolio;
        }),
      );

      try {
        const response = await api.request('post', api.stocks.create(), data);

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to create stock');
        }

        const newStock = response.data;

        setPortfolios((prev) =>
          prev.map((portfolio) => {
            if (portfolio.id === data.portfolio_id) {
              return {
                ...portfolio,
                stocks: (portfolio.stocks || []).map((stock) =>
                  stock.id === tempStock.id ? newStock : stock,
                ),
              };
            }
            return portfolio;
          }),
        );

        return newStock;
      } catch (err) {
        setPortfolios((prev) =>
          prev.map((portfolio) => {
            if (portfolio.id === data.portfolio_id) {
              return {
                ...portfolio,
                stocks: (portfolio.stocks || []).filter(
                  (stock) => stock.id !== tempStock.id,
                ),
              };
            }
            return portfolio;
          }),
        );

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create stock';
        setError(errorMessage);
        console.error('Error creating stock:', err);
        return null;
      }
    },
    [user?.id],
  );

  const updateStock = useCallback(
    async (stockId: string, data: Partial<Stock>): Promise<Stock | null> => {
      if (!user?.id) return null;

      try {
        const response = await api.request(
          'patch',
          api.stocks.update(stockId),
          data,
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to update stock');
        }

        const updatedStock = response.data;

        setPortfolios((prev) =>
          prev.map((portfolio) => ({
            ...portfolio,
            stocks: portfolio.stocks?.map((stock) =>
              stock.id === stockId ? updatedStock : stock,
            ),
          })),
        );

        return updatedStock;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update stock';
        setError(errorMessage);
        console.error('Error updating stock:', err);
        return null;
      }
    },
    [user?.id],
  );

  const deleteStock = useCallback(
    async (stockId: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const response = await api.request(
          'delete',
          api.stocks.delete(stockId),
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to delete stock');
        }

        setPortfolios((prev) =>
          prev.map((portfolio) => ({
            ...portfolio,
            stocks: portfolio.stocks?.filter((stock) => stock.id !== stockId),
          })),
        );

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete stock';
        setError(errorMessage);
        return false;
      }
    },
    [user?.id],
  );

  useEffect(() => {
    const initializePortfolios = async () => {
      if (user?.id) {
        console.log('Initializing portfolios for user:', user.id);

        const cachedPortfolios = await loadPortfoliosFromStorage();
        if (cachedPortfolios.length > 0) {
          console.log('Loaded from storage:', cachedPortfolios);
          setPortfolios(cachedPortfolios);
          setLoading(false);
        }

        await refreshPortfolios();
      } else {
        setPortfolios([]);
        setError(null);
        setLoading(false);
        await clearPortfoliosFromStorage();
      }
    };

    initializePortfolios();
  }, [
    user?.id,
    refreshPortfolios,
    loadPortfoliosFromStorage,
    clearPortfoliosFromStorage,
  ]);

  const value: PortfolioContextType = {
    portfolios,
    loading,
    error,
    refreshPortfolios,
    createPortfolio,
    updatePortfolio,
    getPortfolioByStockId,
    deletePortfolio,
    createStock,
    updateStock,
    deleteStock,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
