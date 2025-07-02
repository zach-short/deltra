import { apiRoutes } from '@/utils/shared/api';

export const portfolioEndpoints = {
  getAll: (userId: string) => apiRoutes.stocks.base(userId),
  getOne: (userId: string, stockId: string) =>
    apiRoutes.stocks.single(userId, stockId),
  create: (userId: string) => apiRoutes.stocks.base(userId),
  update: (userId: string, stockId: string) =>
    apiRoutes.stocks.single(userId, stockId),
  delete: (userId: string, stockId: string) =>
    apiRoutes.stocks.single(userId, stockId),
} as const;
