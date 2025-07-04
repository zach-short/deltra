import { makeApiRequest } from '@/hooks';
import { apiRoutes } from './api-routes';

let getUserId: (() => string) | null = null;
let getFetchWithAuth: (() => any) | null = null;

export function initializeApiClient(
  userIdGetter: () => string,
  fetchWithAuthGetter: () => any,
) {
  getUserId = userIdGetter;
  getFetchWithAuth = fetchWithAuthGetter;
}

class ApiClient {
  private getUserId(): string {
    if (!getUserId) {
      throw new Error(
        'API client not initialized. Call initializeApiClient first.',
      );
    }
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }

  stocks = {
    getAll: () => {
      const userId = this.getUserId();
      return apiRoutes.stocks.base(userId);
    },

    getById: (stockId: string) => {
      const userId = this.getUserId();
      return apiRoutes.stocks.single(userId, stockId);
    },

    create: () => {
      const userId = this.getUserId();
      return apiRoutes.stocks.base(userId);
    },

    update: (stockId: string) => {
      const userId = this.getUserId();
      return apiRoutes.stocks.single(userId, stockId);
    },

    delete: (stockId: string) => {
      const userId = this.getUserId();
      return apiRoutes.stocks.single(userId, stockId);
    },
  };

  portfolios = {
    getAll: () => {
      const userId = this.getUserId();
      return apiRoutes.portfolios.base(userId);
    },

    getById: (portfolioId: string) => {
      const userId = this.getUserId();
      return apiRoutes.portfolios.single(userId, portfolioId);
    },

    create: () => {
      const userId = this.getUserId();
      return apiRoutes.portfolios.base(userId);
    },

    update: (portfolioId: string) => {
      const userId = this.getUserId();
      return apiRoutes.portfolios.single(userId, portfolioId);
    },

    delete: (portfolioId: string) => {
      const userId = this.getUserId();
      return apiRoutes.portfolios.single(userId, portfolioId);
    },
  };

  coveredCalls = {
    getAll: () => {
      const userId = this.getUserId();
      return apiRoutes.coveredCalls.base(userId);
    },

    getById: (callId: string) => {
      const userId = this.getUserId();
      return apiRoutes.coveredCalls.single(userId, callId);
    },

    getForStock: (stockId: string) => {
      const userId = this.getUserId();
      return apiRoutes.coveredCalls.forStock(userId, stockId);
    },

    create: () => {
      const userId = this.getUserId();
      return apiRoutes.coveredCalls.base(userId);
    },

    update: (callId: string) => {
      const userId = this.getUserId();
      return apiRoutes.coveredCalls.single(userId, callId);
    },

    delete: (callId: string) => {
      const userId = this.getUserId();
      return apiRoutes.coveredCalls.single(userId, callId);
    },
  };

  async request<T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    endpoint: string,
    body?: any,
    queryParams?: Record<string, string>,
  ) {
    if (!getFetchWithAuth) {
      throw new Error(
        'API client not initialized. Call initializeApiClient first.',
      );
    }

    const fetchWithAuth = getFetchWithAuth();

    return makeApiRequest<T>(
      method,
      endpoint,
      body,
      queryParams,
      fetchWithAuth,
      true,
    );
  }
}

export const api = new ApiClient();
