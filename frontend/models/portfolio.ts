import { Stock } from './stock';

export type Portfolio = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  stocks?: Stock[];
};
