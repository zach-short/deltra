export interface OptionContract {
  contractSymbol: string;
  strike: number;
  currency: string;
  lastPrice: number;
  change: number;
  percentChange: number;
  volume: number;
  openInterest: number;
  bid: number;
  ask: number;
  contractSize: string;
  expiration: number;
  lastTradeDate: number;
  impliedVolatility: number;
  inTheMoney: boolean;
}

export interface OptionsChainData {
  calls: OptionContract[];
  puts: OptionContract[];
  expirationDates: number[];
  strikes: number[];
}

export const optionsService = {
  async getOptionsChain(symbol: string): Promise<OptionsChainData | null> {
    try {
      const baseUrl =
        typeof window !== 'undefined'
          ? 'https://api.allorigins.win/raw?url='
          : '';

      const url = `${baseUrl}https://query1.finance.yahoo.com/v7/finance/options/${symbol}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        console.warn(`Options API returned ${response.status} for ${symbol}`);
        return generateMockOptionsData(symbol);
      }

      const data = await response.json();
      const optionChain = data.optionChain?.result?.[0];

      if (!optionChain) {
        console.warn(`No option chain data found for ${symbol}`);
        return generateMockOptionsData(symbol);
      }

      return {
        calls: optionChain.options?.[0]?.calls || [],
        puts: optionChain.options?.[0]?.puts || [],
        expirationDates: optionChain.expirationDates || [],
        strikes: optionChain.strikes || [],
      };
    } catch (error) {
      console.error('Error fetching options chain:', error);
      return generateMockOptionsData(symbol);
    }
  },

  async getOptionsChainForDate(
    symbol: string,
    expirationTimestamp: number,
  ): Promise<OptionsChainData | null> {
    try {
      const baseUrl =
        typeof window !== 'undefined'
          ? 'https://api.allorigins.win/raw?url='
          : '';

      const url = `${baseUrl}https://query1.finance.yahoo.com/v7/finance/options/${symbol}?date=${expirationTimestamp}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        console.warn(
          `Options API returned ${response.status} for ${symbol} on date ${expirationTimestamp}`,
        );
        return generateMockOptionsData(symbol);
      }

      const data = await response.json();
      const optionChain = data.optionChain?.result?.[0];

      if (!optionChain) {
        console.warn(
          `No option chain data found for ${symbol} on date ${expirationTimestamp}`,
        );
        return generateMockOptionsData(symbol);
      }

      return {
        calls: optionChain.options?.[0]?.calls || [],
        puts: optionChain.options?.[0]?.puts || [],
        expirationDates: optionChain.expirationDates || [],
        strikes: optionChain.strikes || [],
      };
    } catch (error) {
      console.error('Error fetching options chain for date:', error);
      return generateMockOptionsData(symbol);
    }
  },

  formatExpirationDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    date.setUTCHours(21, 0, 0, 0); // 4 PM EST = 9 PM UTC (without DST)
    return date.toISOString();
  },

  formatExpirationDisplay(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },
};

function generateMockOptionsData(symbol: string): OptionsChainData {
  const currentDate = new Date();
  const expirationDates = [];
  const calls: OptionContract[] = [];

  for (let i = 0; i < 4; i++) {
    const expDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + i + 1,
      15,
    );
    const timestamp = Math.floor(expDate.getTime() / 1000);
    expirationDates.push(timestamp);
  }

  const currentPrice = 150;
  const strikes = [];
  for (
    let strike = currentPrice - 50;
    strike <= currentPrice + 50;
    strike += 5
  ) {
    strikes.push(strike);
  }

  strikes.forEach((strike, index) => {
    const isITM = strike < currentPrice;
    const premium = isITM
      ? currentPrice - strike + Math.random() * 5 + 2
      : Math.random() * 8 + 0.5;

    calls.push({
      contractSymbol: `${symbol}${expirationDates[0]}C${strike.toString().padStart(8, '0')}`,
      strike,
      currency: 'USD',
      lastPrice: premium,
      change: (Math.random() - 0.5) * 2,
      percentChange: (Math.random() - 0.5) * 20,
      volume: Math.floor(Math.random() * 1000),
      openInterest: Math.floor(Math.random() * 5000),
      bid: premium - 0.05,
      ask: premium + 0.05,
      contractSize: 'REGULAR',
      expiration: expirationDates[0],
      lastTradeDate: Math.floor(Date.now() / 1000),
      impliedVolatility: 0.15 + Math.random() * 0.4,
      inTheMoney: isITM,
    });
  });

  return {
    calls,
    puts: [],
    expirationDates,
    strikes,
  };
}

