export type CoveredCall = {
  id: string;
  stock_id: string;
  user_id: string;
  portfolio_id: string;

  strike_price: number;
  premium_received: number;
  contracts: number;
  expiration_date: string;

  status: 'pending' | 'active' | 'expired' | 'assigned' | 'bought_back';

  assignment_date?: string;
  assignment_price?: number;
  buyback_date?: string;
  buyback_premium?: number;

  total_premium: number;
  shares_covered: number;

  created_at: string;
  updated_at: string;
};

