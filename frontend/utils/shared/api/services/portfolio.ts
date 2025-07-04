import { apiRoutes } from '@/utils/shared/api';

export const portfolioEndpoints = {
  getAll: (userId: string) => ({
    url: apiRoutes.portfolios.base(userId),
    method: 'GET' as const,
  }),
  getOne: (userId: string, portfolioId: string) => ({
    url: apiRoutes.portfolios.single(userId, portfolioId),
    method: 'GET' as const,
  }),
  create: (userId: string) => ({
    url: apiRoutes.portfolios.base(userId),
    method: 'POST' as const,
  }),
  update: (userId: string, portfolioId: string) => ({
    url: apiRoutes.portfolios.single(userId, portfolioId),
    method: 'PATCH' as const,
  }),
  delete: (userId: string, portfolioId: string) => ({
    url: apiRoutes.portfolios.single(userId, portfolioId),
    method: 'DELETE' as const,
  }),
} as const;
