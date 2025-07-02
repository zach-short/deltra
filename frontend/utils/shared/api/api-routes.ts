const API_VERSION = 'v1';

const USERS = (userId: string) => `${API_VERSION}/users/${userId}`;

const STOCKS_BASE = (userId: string) => `${USERS(userId)}/stocks`;
const STOCK_BASE = (userId: string, listingId: string) =>
  `${STOCKS_BASE(userId)}/${listingId}`;

export const apiRoutes = {
  version: API_VERSION,

  user: {
    base: USERS,
  },
  stocks: {
    base: STOCKS_BASE,
    single: STOCK_BASE,
  },
} as const;

export { USERS, STOCKS_BASE, STOCK_BASE };

export type ApiRouteBuilder<T extends any[] = []> = (...args: T) => string;

export type UserRoutes = {
  base: ApiRouteBuilder<[userId: string]>;
  protected: ApiRouteBuilder<[userId: string]>;
};

export type StockRoutes = {
  base: ApiRouteBuilder<[userId: string]>;
  single: ApiRouteBuilder<[userId: string, listingId: string]>;
  my: {
    base: ApiRouteBuilder<[userId: string]>;
    single: ApiRouteBuilder<[userId: string, listingId: string]>;
  };
};
