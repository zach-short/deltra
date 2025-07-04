import { CoveredCall } from '@/models';

export const coveredCallHelpers = {
  calculateTotalPremium: (
    premiumReceived: number,
    contracts: number,
  ): number => {
    return premiumReceived * contracts * 100;
  },

  calculateSharesCovered: (contracts: number): number => {
    return contracts * 100;
  },

  calculateAnnualizedReturn: (
    premiumReceived: number,
    strikePrice: number,
    contracts: number,
    daysToExpiration: number,
  ): number => {
    const totalPremium = premiumReceived * contracts * 100;
    const totalInvestment = strikePrice * contracts * 100;
    const returnPercentage = (totalPremium / totalInvestment) * 100;
    return (returnPercentage * 365) / daysToExpiration;
  },

  calculateDaysToExpiration: (expirationDate: string): number => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const timeDiff = expDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  },

  calculateProfitLoss: (coveredCall: CoveredCall): number => {
    const totalPremium = coveredCall.total_premium;
    let profitLoss = totalPremium;

    if (coveredCall.status === 'bought_back' && coveredCall.buyback_premium) {
      profitLoss = totalPremium - coveredCall.buyback_premium;
    } else if (
      coveredCall.status === 'assigned' &&
      coveredCall.assignment_price
    ) {
      profitLoss = totalPremium;
    }

    return profitLoss;
  },

  isExpired: (expirationDate: string): boolean => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    return expDate < today;
  },

  isExpiringSoon: (
    expirationDate: string,
    daysThreshold: number = 7,
  ): boolean => {
    const daysToExpiration =
      coveredCallHelpers.calculateDaysToExpiration(expirationDate);
    return daysToExpiration <= daysThreshold && daysToExpiration > 0;
  },

  getStatusColor: (status: CoveredCall['status']): string => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'expired':
        return '#6B7280';
      case 'assigned':
        return '#3B82F6';
      case 'bought_back':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  },

  getStatusLabel: (status: CoveredCall['status']): string => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'assigned':
        return 'Assigned';
      case 'bought_back':
        return 'Bought Back';
      default:
        return 'Unknown';
    }
  },

  formatPremium: (premium: number): string => {
    return `$${premium.toFixed(2)}`;
  },

  formatStrikePrice: (strikePrice: number): string => {
    return `$${strikePrice.toFixed(2)}`;
  },

  formatExpirationDate: (expirationDate: string): string => {
    const date = new Date(expirationDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  sortByExpiration: (coveredCalls: CoveredCall[]): CoveredCall[] => {
    return [...coveredCalls].sort((a, b) => {
      return (
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
      );
    });
  },

  sortByPremium: (coveredCalls: CoveredCall[]): CoveredCall[] => {
    return [...coveredCalls].sort((a, b) => b.total_premium - a.total_premium);
  },

  filterByStatus: (
    coveredCalls: CoveredCall[],
    status: CoveredCall['status'],
  ): CoveredCall[] => {
    return coveredCalls.filter((call) => call.status === status);
  },

  filterByStock: (
    coveredCalls: CoveredCall[],
    stockId: string,
  ): CoveredCall[] => {
    return coveredCalls.filter((call) => call.stock_id === stockId);
  },

  getActiveCalls: (coveredCalls: CoveredCall[]): CoveredCall[] => {
    return coveredCallHelpers.filterByStatus(coveredCalls, 'active');
  },

  getExpiredCalls: (coveredCalls: CoveredCall[]): CoveredCall[] => {
    return coveredCallHelpers.filterByStatus(coveredCalls, 'expired');
  },

  getAssignedCalls: (coveredCalls: CoveredCall[]): CoveredCall[] => {
    return coveredCallHelpers.filterByStatus(coveredCalls, 'assigned');
  },

  getBoughtBackCalls: (coveredCalls: CoveredCall[]): CoveredCall[] => {
    return coveredCallHelpers.filterByStatus(coveredCalls, 'bought_back');
  },

  calculateTotalPremiumReceived: (coveredCalls: CoveredCall[]): number => {
    return coveredCalls.reduce((total, call) => total + call.total_premium, 0);
  },

  calculateTotalSharesCovered: (coveredCalls: CoveredCall[]): number => {
    return coveredCalls.reduce((total, call) => total + call.shares_covered, 0);
  },

  calculateAverageStrikePrice: (coveredCalls: CoveredCall[]): number => {
    if (coveredCalls.length === 0) return 0;
    const totalStrike = coveredCalls.reduce(
      (total, call) => total + call.strike_price,
      0,
    );
    return totalStrike / coveredCalls.length;
  },
};

