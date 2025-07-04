import { apiRoutes } from '@/utils/shared/api';

export const stockEndpoints = {
  getAll: (userId: string) => ({
    url: apiRoutes.stocks.base(userId),
    method: 'GET' as const,
  }),
  getOne: (userId: string, stockId: string) => ({
    url: apiRoutes.stocks.single(userId, stockId),
    method: 'GET' as const,
  }),
  create: (userId: string) => ({
    url: apiRoutes.stocks.base(userId),
    method: 'POST' as const,
  }),
  update: (userId: string, stockId: string) => ({
    url: apiRoutes.stocks.single(userId, stockId),
    method: 'PATCH' as const,
  }),
  delete: (userId: string, stockId: string) => ({
    url: apiRoutes.stocks.single(userId, stockId),
    method: 'DELETE' as const,
  }),
} as const;
