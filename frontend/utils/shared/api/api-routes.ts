const ROOT = '/v1';

const USERS = (userId: string) => `${ROOT}/users/${userId}`;

const STOCKS_BASE = (userId: string) => `${USERS(userId)}/stocks`;
const STOCK_BASE = (userId: string, stockId: string) =>
  `${STOCKS_BASE(userId)}/${stockId}`;

const PORTFOLIOS_BASE = (userId: string) => `${USERS(userId)}/portfolios`;
const PORTFOLIO_BASE = (userId: string, portfolioId: string) =>
  `${PORTFOLIOS_BASE(userId)}/${portfolioId}`;

const COVERED_CALLS_BASE = (userId: string) => `${USERS(userId)}/covered-calls`;
const COVERED_CALL_BASE = (userId: string, callId: string) =>
  `${COVERED_CALLS_BASE(userId)}/${callId}`;
const STOCK_COVERED_CALLS_BASE = (userId: string, stockId: string) =>
  `${STOCK_BASE(userId, stockId)}/covered-calls`;

export const apiRoutes = {
  version: ROOT,
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
  coveredCalls: {
    base: COVERED_CALLS_BASE,
    single: COVERED_CALL_BASE,
    forStock: STOCK_COVERED_CALLS_BASE,
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
