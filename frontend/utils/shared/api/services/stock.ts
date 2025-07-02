import { apiRoutes } from '@/utils/shared/api';

/**
 * Stock API endpoint helpers - use with useFetch/useAction hooks
 * 
 * Example:
 * const { data } = useFetch('get', stockEndpoints.getAll(userId));
 * const createStock = useAction('post', stockEndpoints.create(userId));
 */
export const stockEndpoints = {
  getAll: (userId: string) => apiRoutes.stocks.base(userId),
  getOne: (userId: string, stockId: string) => apiRoutes.stocks.single(userId, stockId),
  create: (userId: string) => apiRoutes.stocks.base(userId),
  update: (userId: string, stockId: string) => apiRoutes.stocks.single(userId, stockId),
  delete: (userId: string, stockId: string) => apiRoutes.stocks.single(userId, stockId),
  
  // Special endpoints
  generateDescription: (userId: string) => `${apiRoutes.stocks.base(userId)}/description`,
  validateTitle: (userId: string) => `${apiRoutes.stocks.base(userId)}/validate-title`,
  createNewTitle: (userId: string) => `${apiRoutes.stocks.base(userId)}/new-title`,
} as const;
