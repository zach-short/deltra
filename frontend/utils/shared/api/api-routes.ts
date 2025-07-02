const API_VERSION = 'v1';

const USERS = (userId: string) => `${API_VERSION}/users/${userId}`;

const STOCKS_BASE = (userId: string) => `${USERS(userId)}/stocks`;
const STOCK_BASE = (userId: string, stockId: string) =>
  `${STOCKS_BASE(userId)}/${stockId}`;

const PORTFOLIOS_BASE = (userId: string) => `${USERS(userId)}/portfolios`;
const PORTFOLIO_BASE = (userId: string, portfolioId: string) =>
  `${PORTFOLIOS_BASE(userId)}/${portfolioId}`;

export const apiRoutes = {
  version: API_VERSION,
  user: {
    base: USERS,
  },
  stocks: {
    base: STOCKS_BASE,
    single: STOCK_BASE,
  },
  portfolios: {
    base: PORTFOLIOS_BASE,
    single: PORTFOLIO_BASE,
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
