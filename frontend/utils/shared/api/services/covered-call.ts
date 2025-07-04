import { apiRoutes } from '@/utils/shared/api';
import { CoveredCall } from '@/models';

export const coveredCallEndpoints = {
  getAll: (userId: string) => ({
    url: apiRoutes.coveredCalls.base(userId),
    method: 'GET' as const,
  }),
  getOne: (userId: string, callId: string) => ({
    url: apiRoutes.coveredCalls.single(userId, callId),
    method: 'GET' as const,
  }),
  create: (userId: string) => ({
    url: apiRoutes.coveredCalls.base(userId),
    method: 'POST' as const,
  }),
  update: (userId: string, callId: string) => ({
    url: apiRoutes.coveredCalls.single(userId, callId),
    method: 'PATCH' as const,
  }),
  delete: (userId: string, callId: string) => ({
    url: apiRoutes.coveredCalls.single(userId, callId),
    method: 'DELETE' as const,
  }),
  getForStock: (userId: string, stockId: string) => ({
    url: apiRoutes.coveredCalls.forStock(userId, stockId),
    method: 'GET' as const,
  }),
  createForStock: (userId: string, stockId: string) => ({
    url: apiRoutes.coveredCalls.forStock(userId, stockId),
    method: 'POST' as const,
  }),
  activate: (userId: string, callId: string) => ({
    url: `${apiRoutes.coveredCalls.single(userId, callId)}/activate`,
    method: 'POST' as const,
  }),
} as const;

export type CreateCoveredCallData = {
  stock_id: string;
  strike_price: number;
  premium_received: number;
  contracts: number;
  expiration_date: string;
  portfolio_id?: string;
};

export type UpdateCoveredCallData = Partial<{
  strike_price: number;
  premium_received: number;
  contracts: number;
  expiration_date: string;
  status: 'pending' | 'active' | 'expired' | 'assigned' | 'bought_back';
  assignment_date: string;
  assignment_price: number;
  buyback_date: string;
  buyback_premium: number;
}>;

export type CoveredCallApiMethods = {
  getCoveredCalls: (userId: string) => Promise<CoveredCall[]>;
  getCoveredCall: (userId: string, callId: string) => Promise<CoveredCall>;
  createCoveredCall: (userId: string, data: CreateCoveredCallData) => Promise<CoveredCall>;
  updateCoveredCall: (userId: string, callId: string, data: UpdateCoveredCallData) => Promise<CoveredCall>;
  deleteCoveredCall: (userId: string, callId: string) => Promise<void>;
  getStockCoveredCalls: (userId: string, stockId: string) => Promise<CoveredCall[]>;
  createStockCoveredCall: (userId: string, stockId: string, data: CreateCoveredCallData) => Promise<CoveredCall>;
  activateCoveredCall: (userId: string, callId: string) => Promise<CoveredCall>;
};

export const coveredCallService = (
  makeRequest: (url: string, options?: RequestInit) => Promise<any>
): CoveredCallApiMethods => ({
  getCoveredCalls: async (userId: string) => {
    const endpoint = coveredCallEndpoints.getAll(userId);
    return makeRequest(endpoint.url, { method: endpoint.method });
  },

  getCoveredCall: async (userId: string, callId: string) => {
    const endpoint = coveredCallEndpoints.getOne(userId, callId);
    return makeRequest(endpoint.url, { method: endpoint.method });
  },

  createCoveredCall: async (userId: string, data: CreateCoveredCallData) => {
    const endpoint = coveredCallEndpoints.create(userId);
    return makeRequest(endpoint.url, {
      method: endpoint.method,
      body: JSON.stringify(data),
    });
  },

  updateCoveredCall: async (userId: string, callId: string, data: UpdateCoveredCallData) => {
    const endpoint = coveredCallEndpoints.update(userId, callId);
    return makeRequest(endpoint.url, {
      method: endpoint.method,
      body: JSON.stringify(data),
    });
  },

  deleteCoveredCall: async (userId: string, callId: string) => {
    const endpoint = coveredCallEndpoints.delete(userId, callId);
    return makeRequest(endpoint.url, { method: endpoint.method });
  },

  getStockCoveredCalls: async (userId: string, stockId: string) => {
    const endpoint = coveredCallEndpoints.getForStock(userId, stockId);
    return makeRequest(endpoint.url, { method: endpoint.method });
  },

  createStockCoveredCall: async (userId: string, stockId: string, data: CreateCoveredCallData) => {
    const endpoint = coveredCallEndpoints.createForStock(userId, stockId);
    return makeRequest(endpoint.url, {
      method: endpoint.method,
      body: JSON.stringify(data),
    });
  },

  activateCoveredCall: async (userId: string, callId: string) => {
    const endpoint = coveredCallEndpoints.activate(userId, callId);
    return makeRequest(endpoint.url, { method: endpoint.method });
  },
});