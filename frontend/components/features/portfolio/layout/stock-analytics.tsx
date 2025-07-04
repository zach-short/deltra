import { View, Text, StyleSheet } from 'react-native';
import { Stock } from '@/models';
import { fonts } from '@/components/shared/ui/typography/fonts';

interface StockAnalyticsProps {
  stock: Stock;
}

export function StockAnalytics({ stock }: StockAnalyticsProps) {
  const calculateMaxProfit = () => {
    if (!stock.covered_calls || stock.covered_calls.length === 0) {
      return {
        scenario: 'No Covered Calls',
        maxProfit: 0,
        breakeven: stock.adjusted_basis,
        targetPrice: 0,
        premiumIncome: 0,
        capitalGains: 0,
      };
    }

    const activeCalls = stock.covered_calls.filter(
      (call) => call.status === 'active',
    );

    if (activeCalls.length === 0) {
      return {
        scenario: 'No Active Calls',
        maxProfit: 0,
        breakeven: stock.adjusted_basis,
        targetPrice: 0,
        premiumIncome: stock.total_premium,
        capitalGains: 0,
      };
    }

    const highestStrike = Math.max(
      ...activeCalls.map((call) => call.strike_price),
    );
    const totalActiveShares = activeCalls.reduce(
      (sum, call) => sum + call.shares_covered,
      0,
    );
    const activePremium = activeCalls.reduce(
      (sum, call) => sum + call.total_premium,
      0,
    );

    const capitalGains =
      (highestStrike - stock.adjusted_basis) * totalActiveShares;
    const maxProfit = capitalGains + activePremium;
    const maxProfitPercentage =
      (maxProfit / (stock.adjusted_basis * totalActiveShares)) * 100;

    return {
      scenario: 'Assignment at Highest Strike',
      maxProfit,
      maxProfitPercentage,
      breakeven: stock.adjusted_basis,
      targetPrice: highestStrike,
      premiumIncome: activePremium,
      capitalGains,
      sharesAtRisk: totalActiveShares,
    };
  };

  const calculateDownsideProtection = () => {
    const premiumPerShare = stock.total_premium / stock.shares;
    const protectionPercentage = (premiumPerShare / stock.basis) * 100;
    const protectedPrice = stock.basis - premiumPerShare;

    return {
      premiumPerShare,
      protectionPercentage,
      protectedPrice,
    };
  };

  const calculateAnnualizedReturn = () => {
    if (!stock.covered_calls || stock.covered_calls.length === 0) return 0;

    const activeCalls = stock.covered_calls.filter(
      (call) => call.status === 'active',
    );
    if (activeCalls.length === 0) return 0;

    const totalPremium = activeCalls.reduce(
      (sum, call) => sum + call.total_premium,
      0,
    );
    const totalShares = activeCalls.reduce(
      (sum, call) => sum + call.shares_covered,
      0,
    );

    if (totalShares === 0) return 0;

    const averageDaysToExpiry = activeCalls.reduce((sum, call) => {
      const daysToExpiry = Math.max(
        1,
        Math.ceil(
          (new Date(call.expiration_date).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      const weight = call.shares_covered / totalShares;
      return sum + daysToExpiry * weight;
    }, 0);

    const investment = stock.adjusted_basis * totalShares;
    const returnRate = totalPremium / investment;
    const annualizedReturn = (returnRate * 365) / averageDaysToExpiry;

    return annualizedReturn * 100;
  };

  const maxProfitData = calculateMaxProfit();
  const downsideData = calculateDownsideProtection();
  const annualizedReturn = calculateAnnualizedReturn();

  const analyticsCards = [
    {
      title: 'Max Profit Scenario',
      subtitle: maxProfitData.scenario,
      value:
        maxProfitData.maxProfit > 0
          ? `$${maxProfitData.maxProfit.toFixed(2)}`
          : 'N/A',
      secondary: maxProfitData.maxProfitPercentage
        ? `${maxProfitData.maxProfitPercentage.toFixed(1)}% return`
        : '',
      color: '#00C805',
    },
    {
      title: 'Target Assignment Price',
      subtitle: 'Highest active strike',
      value:
        maxProfitData.targetPrice > 0
          ? `$${maxProfitData.targetPrice.toFixed(2)}`
          : 'N/A',
      secondary: maxProfitData.sharesAtRisk
        ? `${maxProfitData.sharesAtRisk} shares at risk`
        : '',
      color: '#FF9500',
    },
    {
      title: 'Downside Protection',
      subtitle: 'From premium collected',
      value: `$${downsideData.protectedPrice.toFixed(2)}`,
      secondary: `${downsideData.protectionPercentage.toFixed(1)}% protection`,
      color: '#007AFF',
    },
    {
      title: 'Annualized Return',
      subtitle: 'From active calls',
      value: annualizedReturn > 0 ? `${annualizedReturn.toFixed(1)}%` : 'N/A',
      secondary: 'Based on current positions',
      color: '#00C805',
    },
  ];

  const profitBreakdown = [
    {
      label: 'Premium Income',
      value: maxProfitData.premiumIncome,
      color: '#00C805',
    },
    {
      label: 'Capital Gains',
      value: maxProfitData.capitalGains,
      color: '#007AFF',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>
          Performance metrics and profit scenarios
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {analyticsCards.map((card, index) => (
          <View key={index} style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            <Text style={[styles.cardValue, { color: card.color }]}>
              {card.value}
            </Text>
            {card.secondary && (
              <Text style={styles.cardSecondary}>{card.secondary}</Text>
            )}
          </View>
        ))}
      </View>

      {maxProfitData.maxProfit > 0 && (
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Max Profit Breakdown</Text>
          <View style={styles.breakdownCard}>
            {profitBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={[styles.breakdownValue, { color: item.color }]}>
                  ${item.value.toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Max Profit</Text>
              <Text style={styles.totalValue}>
                ${maxProfitData.maxProfit.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>Key Insights</Text>
        <View style={styles.insightsList}>
          <View style={styles.insightItem}>
            <Text style={styles.insightDot}>•</Text>
            <Text style={styles.insightText}>
              Your effective cost basis is ${stock.adjusted_basis.toFixed(2)} ($
              {(stock.basis - stock.adjusted_basis).toFixed(2)} reduced from
              premiums)
            </Text>
          </View>

          {maxProfitData.maxProfit > 0 && (
            <View style={styles.insightItem}>
              <Text style={styles.insightDot}>•</Text>
              <Text style={styles.insightText}>
                If assigned at ${maxProfitData.targetPrice.toFixed(2)}, you'll
                realize a {maxProfitData.maxProfitPercentage?.toFixed(1)}%
                return on your covered shares
              </Text>
            </View>
          )}

          <View style={styles.insightItem}>
            <Text style={styles.insightDot}>•</Text>
            <Text style={styles.insightText}>
              You have downside protection down to $
              {downsideData.protectedPrice.toFixed(2)} (
              {downsideData.protectionPercentage.toFixed(1)}% below original
              cost)
            </Text>
          </View>

          {stock.shares_available >= 100 && (
            <View style={styles.insightItem}>
              <Text style={styles.insightDot}>•</Text>
              <Text style={styles.insightText}>
                You can sell {Math.floor(stock.shares_available / 100)} more
                covered call
                {Math.floor(stock.shares_available / 100) === 1 ? '' : 's'} with
                your remaining {stock.shares_available} shares
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: fonts.interBold,
    marginBottom: 4,
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
    fontFamily: fonts.interRegular,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.interMedium,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
    fontFamily: fonts.interRegular,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontFamily: fonts.interBold,
    marginBottom: 4,
  },
  cardSecondary: {
    color: '#FFFFFF',
    opacity: 0.5,
    fontSize: 11,
    fontFamily: fonts.interRegular,
  },
  breakdownSection: {
    padding: 20,
    paddingTop: 0,
  },
  breakdownTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interBold,
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: 'rgba(0, 200, 5, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 5, 0.2)',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.interRegular,
  },
  breakdownValue: {
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interBold,
  },
  totalValue: {
    color: '#00C805',
    fontSize: 18,
    fontFamily: fonts.interBold,
  },
  insightsSection: {
    padding: 20,
    paddingTop: 0,
  },
  insightsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interBold,
    marginBottom: 12,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightDot: {
    color: '#00C805',
    fontSize: 16,
    fontFamily: fonts.interBold,
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 14,
    fontFamily: fonts.interRegular,
    lineHeight: 20,
  },
});

