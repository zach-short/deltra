import { CoveredCall } from './covered-call';

export type Stock = {
  id: string;
  symbol: string;
  basis: number;
  shares: number;
  user_id: string;
  portfolio_id: string;
  created_at: string;
  updated_at: string;
  covered_calls?: CoveredCall[];
  
  adjusted_basis: number;
  total_premium: number;
  active_calls: number;
  shares_covered: number;
  shares_available: number;
};
