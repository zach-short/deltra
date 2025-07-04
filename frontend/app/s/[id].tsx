import { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  StockAnalytics,
  BottomSheet,
  CoveredCallManager,
  CreateCoveredCallSheet,
  fonts,
} from '@/components';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCoveredCall, usePortfolio, useStock } from '@/context';

type TabType = 'overview' | 'calls' | 'analytics';

export interface CreateCoveredCallForm {
  strike_price: string;
  premium_received: string;
  contracts: string;
  expiration_date: string;
  selectedContract?: any;
}

export default function StockManagementPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { refreshCoveredCalls } = useCoveredCall();
  const {
    currentStock: stock,
    loading,
    loadStock,
    createCoveredCall,
    creatingCoveredCall,
  } = useStock();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showCreateCoveredCall, setShowCreateCoveredCall] = useState(false);
  const [coveredCallForm, setCoveredCallForm] = useState<CreateCoveredCallForm>(
    {
      strike_price: '',
      premium_received: '',
      contracts: '',
      expiration_date: '',
    },
  );

  useEffect(() => {
    if (id) {
      loadStock(id).catch((error) => {
        if (error.message === 'NAVIGATE_BACK') {
          router.back();
        }
      });
    }
  }, [id, loadStock, router]);

  const handleCreateCoveredCall = async () => {
    if (!stock) return;

    const { strike_price, premium_received, contracts, expiration_date } =
      coveredCallForm;

    if (!strike_price || !premium_received || !contracts || !expiration_date) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await createCoveredCall({
        stock_id: stock.id,
        strike_price: parseFloat(strike_price),
        premium_received: parseFloat(premium_received),
        contracts: parseInt(contracts),
        expiration_date: expiration_date,
      });

      setShowCreateCoveredCall(false);
      setCoveredCallForm({
        strike_price: '',
        premium_received: '',
        contracts: '',
        expiration_date: '',
      });

      await refreshCoveredCalls();
    } catch (error) {
      console.error('Covered call creation failed:', error);
    }
  };

  if (loading || !stock) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const totalValue = stock.shares * stock.basis;
  const totalCalls = stock.covered_calls?.length || 0;
  const costReductionPercent =
    stock.shares > 0
      ? ((stock.basis - stock.adjusted_basis) / stock.basis) * 100
      : 0;

  const tabs = [
    { key: 'overview' as TabType, label: 'Overview' },
    {
      key: 'calls' as TabType,
      label: 'Calls',
      badge: totalCalls > 0 ? totalCalls : undefined,
    },
    { key: 'analytics' as TabType, label: 'Analytics' },
  ];

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Shares Owned</Text>
          <Text style={styles.metricValue}>{stock.shares}</Text>
          <Text style={styles.metricSecondary}>
            at ${stock.basis.toFixed(2)} avg
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Value</Text>
          <Text style={styles.metricValue}>${totalValue.toFixed(2)}</Text>
          <Text style={styles.metricSecondary}>Current position value</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Premium Collected</Text>
          <Text style={styles.metricValue}>
            ${stock.total_premium.toFixed(2)}
          </Text>
          <Text style={styles.metricSecondary}>Total from all calls</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Cost Reduction</Text>
          <Text style={styles.metricValue}>
            {costReductionPercent.toFixed(1)}%
          </Text>
          <Text style={styles.metricSecondary}>From covered calls</Text>
        </View>
      </View>

      <View style={styles.performanceSection}>
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

      <View style={styles.actionsSection}>
        {stock.shares_available >= 100 && (
          <Pressable
            style={[
              styles.actionButton,
              styles.primaryActionButton,
              stock.shares_available < 100 && styles.disabledButton,
            ]}
            onPress={() => setShowCreateCoveredCall(true)}
            wrapInText={false}
          >
            <Text
              style={[
                styles.primaryActionButtonText,
                stock.shares_available < 100 && styles.disabledButtonText,
              ]}
            >
              Sell Covered Call
            </Text>
          </Pressable>
        )}

        {stock.shares_available < 100 && (
          <Text style={styles.actionNote}>
            You need at least 100 shares to sell a covered call
          </Text>
        )}
      </View>

      <View style={styles.quickStatsSection}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.quickStatsList}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatLabel}>Shares Available</Text>
            <Text style={styles.quickStatValue}>{stock.shares_available}</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatLabel}>Active Calls</Text>
            <Text style={styles.quickStatValue}>{stock.active_calls || 0}</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatLabel}>Max New Calls</Text>
            <Text style={styles.quickStatValue}>
              {Math.floor(stock.shares_available / 100)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCalls = () => (
    <View style={styles.tabContent}>
      {stock && <CoveredCallManager stock={stock} onClose={() => {}} />}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.tabContent}>
      {stock && <StockAnalytics stock={stock} />}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'calls':
        return renderCalls();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.push('/')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>

          <View style={styles.stockInfo}>
            <View style={styles.symbolContainer}>
              <Text style={styles.symbol}>{stock.symbol}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.stockName}>{stock.symbol} Holdings</Text>
              <Text style={styles.lastUpdated}>
                Last updated: {new Date(stock.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
              {tab.badge && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {renderTabContent()}

        <BottomSheet
          isVisible={showCreateCoveredCall}
          onClose={() => {
            setShowCreateCoveredCall(false);
            setCoveredCallForm({
              strike_price: '',
              premium_received: '',
              contracts: '',
              expiration_date: '',
            });
          }}
          title={`Sell ${stock.symbol} Covered Call`}
          snapPoints={['75%', '95%']}
        >
          <CreateCoveredCallSheet
            form={coveredCallForm}
            stock={stock}
            onFormChange={setCoveredCallForm}
            onSubmit={handleCreateCoveredCall}
            onClose={() => {
              setShowCreateCoveredCall(false);
              setCoveredCallForm({
                strike_price: '',
                premium_received: '',
                contracts: '',
                expiration_date: '',
              });
            }}
            loading={creatingCoveredCall}
          />
        </BottomSheet>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interRegular,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 200, 5, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  symbol: {
    color: '#00C805',
    fontSize: 10,
    fontFamily: fonts.interBold,
  },
  headerText: {
    flex: 1,
  },
  stockName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interBold,
    marginBottom: 4,
  },
  lastUpdated: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
    fontFamily: fonts.interRegular,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#000000',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00C805',
  },
  tabText: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  activeTabText: {
    color: '#00C805',
    opacity: 1,
  },
  tabBadge: {
    backgroundColor: '#00C805',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
    marginTop: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontFamily: fonts.interBold,
  },
  tabContent: {
    flex: 1,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
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
    fontFamily: fonts.interRegular,
  },
  performanceSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interBold,
    marginBottom: 16,
  },
  performanceCard: {
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
  performanceSecondary: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
    fontFamily: fonts.interRegular,
  },
  performanceNote: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
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
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryActionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  disabledButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  actionNote: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
    fontFamily: fonts.interRegular,
    textAlign: 'center',
  },
  quickStatsSection: {
    padding: 20,
    paddingTop: 0,
  },
  quickStatsList: {
    gap: 12,
  },
  quickStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  quickStatLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.interMedium,
  },
  quickStatValue: {
    color: '#00C805',
    fontSize: 16,
    fontFamily: fonts.interBold,
  },
});
