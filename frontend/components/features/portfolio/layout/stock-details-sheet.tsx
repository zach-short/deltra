import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stock } from '@/models';
import { fonts } from '@/components/shared/ui/typography/fonts';
import { Pressable } from '@/components';
import { useRouter } from 'expo-router';

interface StockDetailsSheetProps {
  stock: Stock;
}

export function StockDetailsSheet({ stock }: StockDetailsSheetProps) {
  const router = useRouter();

  const totalValue = stock.shares * stock.basis;
  const totalCalls = stock.covered_calls?.length || 0;
  const costReductionPercent =
    stock.shares > 0
      ? ((stock.basis - stock.adjusted_basis) / stock.basis) * 100
      : 0;

  const handleManageStock = () => {
    router.push(`/s/${stock.id}`);
  };

  const metrics = [
    {
      label: 'Shares Owned',
      value: stock.shares.toString(),
      secondary: `at $${stock.basis.toFixed(2)} avg`,
    },
    {
      label: 'Total Value',
      value: `$${totalValue.toFixed(2)}`,
      secondary: 'Current position value',
    },
    {
      label: 'Covered Calls Sold',
      value: totalCalls.toString(),
      secondary: `${stock.active_calls} currently active`,
    },
    {
      label: 'Premium Collected',
      value: `$${stock.total_premium.toFixed(2)}`,
      secondary: 'Total from all calls',
    },
    {
      label: 'Cost Basis Reduction',
      value: `${costReductionPercent.toFixed(1)}%`,
      secondary: 'From covered calls',
    },
    {
      label: 'Shares Available',
      value: stock.shares_available.toString(),
      secondary: 'For new covered calls',
    },
  ];

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.symbolContainer}>
            <Text style={styles.symbol}>{stock.symbol}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.stockName}>{stock.symbol} Holdings</Text>
            <Text style={styles.lastUpdated}>
              Last updated: {new Date(stock.updated_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricSecondary}>{metric.secondary}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Effective Cost Basis</Text>
              <Text style={styles.performanceValue}>
                ${stock.adjusted_basis.toFixed(2)}
              </Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Original Cost Basis</Text>
              <Text style={styles.performanceSecondary}>
                ${stock.basis.toFixed(2)}
              </Text>
            </View>
            <Text style={styles.performanceNote}>
              After accounting for covered call premiums
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={handleManageStock}
            >
              <Text style={styles.primaryActionButtonText}>
                Manage Stock & Covered Calls
              </Text>
            </Pressable>
            <Text style={styles.actionNote}>
              View analytics, sell covered calls, and manage your {stock.symbol}{' '}
              position
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Covered Calls</Text>
          <View style={styles.activityList}>
            {stock.covered_calls && stock.covered_calls.length > 0 ? (
              stock.covered_calls.slice(0, 5).map((call) => (
                <View key={call.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Text style={styles.activityIconText}>
                      {call.status === 'active'
                        ? '📞'
                        : call.status === 'expired'
                          ? '⏰'
                          : call.status === 'assigned'
                            ? '📤'
                            : '🔄'}
                    </Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>
                      ${call.strike_price} Call • {call.contracts} contracts
                    </Text>
                    <Text style={styles.activityDate}>
                      {call.status.charAt(0).toUpperCase() +
                        call.status.slice(1)}{' '}
                      • Exp:{' '}
                      {new Date(call.expiration_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.activityAmount,
                      {
                        color: call.status === 'active' ? '#00C805' : '#FFFFFF',
                      },
                    ]}
                  >
                    +${call.total_premium.toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No covered calls sold yet
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Start generating income by selling covered calls on your{' '}
                  {stock.symbol} position
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  symbolContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 200, 5, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  symbol: {
    color: '#00C805',
    fontSize: 16,
    fontFamily: fonts.interBold,
  },
  headerInfo: {
    flex: 1,
  },
  stockName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: fonts.interBold,
    marginBottom: 4,
  },
  lastUpdated: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 14,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricLabel: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 12,
    fontFamily: fonts.interMedium,
    marginBottom: 8,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interBold,
    marginBottom: 4,
  },
  metricSecondary: {
    color: '#FFFFFF',
    opacity: 0.5,
    fontSize: 11,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interBold,
    marginBottom: 16,
  },
  performanceCard: {
    backgroundColor: 'rgba(0, 200, 5, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 5, 0.2)',
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  performanceValue: {
    color: '#00C805',
    fontSize: 18,
    fontFamily: fonts.interBold,
  },
  performanceNote: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
    fontStyle: 'italic',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
    marginBottom: 2,
  },
  activityDate: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
  },
  activityAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interBold,
  },
  performanceSecondary: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
    fontFamily: fonts.interRegular,
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 14,
    fontFamily: fonts.interRegular,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionButton: {
    backgroundColor: '#00C805',
  },
  primaryActionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  actionNote: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
    fontFamily: fonts.interRegular,
    textAlign: 'center',
  },
});
