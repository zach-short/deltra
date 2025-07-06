import { useState, useCallback } from 'react';
import { usePortfolio } from '@/context/portfolio';
import { Alert, StyleSheet, Platform, ScrollView } from 'react-native';
import {
  View,
  Text,
  Pressable,
  LoadingDots,
  SafeAreaView,
  fonts,
  BottomSheet,
} from '@/components';
import { Stock } from '@/models';
import {
  StockDetailsSheet,
  PortfolioAccordion,
  CreateStockSheet,
  CreatePortfolioSheet,
} from '@/components/features/portfolio/layout';

interface CreatePortfolioForm {
  name: string;
}

interface CreateStockForm {
  symbol: string;
  shares: string;
  basis: string;
  portfolioId: string;
}

export function PortfolioManager() {
  const {
    portfolios,
    loading: portfoliosLoading,
    createPortfolio: contextCreatePortfolio,
    updatePortfolio: contextUpdatePortfolio,
    deletePortfolio: contextDeletePortfolio,
    createStock: contextCreateStock,
    deleteStock: contextDeleteStock,
  } = usePortfolio();

  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showCreateStock, setShowCreateStock] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [creatingPortfolio, setCreatingPortfolio] = useState(false);
  const [updatingPortfolio, setUpdatingPortfolio] = useState(false);
  const [creatingStock, setCreatingStock] = useState(false);

  const [portfolioForm, setPortfolioForm] = useState<CreatePortfolioForm>({
    name: '',
  });
  const [stockForm, setStockForm] = useState<CreateStockForm>({
    symbol: '',
    shares: '',
    basis: '',
    portfolioId: '',
  });

  const handleCreatePortfolio = useCallback(async () => {
    if (!portfolioForm.name.trim()) {
      Alert.alert('Error', 'Please enter a portfolio name');
      return;
    }

    setCreatingPortfolio(true);
    try {
      const result = await contextCreatePortfolio(portfolioForm.name.trim());
      if (result) {
        setShowCreatePortfolio(false);
        setPortfolioForm({ name: '' });
      } else {
        Alert.alert('Error', 'Failed to create portfolio');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create portfolio');
      console.error('Portfolio creation error:', error);
    } finally {
      setCreatingPortfolio(false);
    }
  }, [portfolioForm.name, contextCreatePortfolio]);

  const handleUpdatePortfolio = useCallback(
    async (name: string) => {
      if (!name.trim() || !editingPortfolio) {
        Alert.alert('Error', 'Please enter a portfolio name');
        return;
      }

      setUpdatingPortfolio(true);
      try {
        const result = await contextUpdatePortfolio(
          editingPortfolio,
          name.trim(),
        );
        if (result) {
          setEditingPortfolio(null);
        } else {
          Alert.alert('Error', 'Failed to update portfolio');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to update portfolio');
        console.error(error);
      } finally {
        setUpdatingPortfolio(false);
      }
    },
    [editingPortfolio, contextUpdatePortfolio],
  );

  const handleCreateStock = useCallback(async () => {
    const { symbol, shares, basis, portfolioId } = stockForm;

    if (!symbol || !shares || !basis) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    let targetPortfolioId = portfolioId;

    setCreatingStock(true);
    try {
      if (targetPortfolioId === '' && portfolios?.length === 0) {
        const defaultPortfolio = await contextCreatePortfolio('Portfolio 1');
        if (!defaultPortfolio) return;
        targetPortfolioId = defaultPortfolio.id;
      } else if (portfolios && !targetPortfolioId && portfolios.length > 0) {
        targetPortfolioId = portfolios[0].id;
      }

      const result = await contextCreateStock({
        symbol: symbol.toUpperCase(),
        shares: parseFloat(shares),
        basis: parseFloat(basis),
        portfolio_id: targetPortfolioId,
      });

      if (result) {
        setShowCreateStock(false);
        setStockForm({ symbol: '', shares: '', basis: '', portfolioId: '' });
      } else {
        Alert.alert('Error', 'Failed to create stock');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create stock');
      console.error(error);
    } finally {
      setCreatingStock(false);
    }
  }, [stockForm, portfolios, contextCreateStock, contextCreatePortfolio]);

  if (portfoliosLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LoadingDots />
        <Text style={styles.loadingText}>Loading your portfolios...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior='automatic'
      >
        <View style={styles.quickActions}>
          <Pressable
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => setShowCreateStock(true)}
            accessibilityLabel='Add Stock'
          >
            <Text style={styles.primaryActionText}>+ Add Stock</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => setShowCreatePortfolio(true)}
            accessibilityLabel='Create Portfolio'
          >
            <Text style={styles.secondaryActionText}>+ Portfolio</Text>
          </Pressable>
        </View>

        {portfolios?.length === 0 ? (
          <EmptyState onCreatePortfolio={() => setShowCreatePortfolio(true)} />
        ) : (
          <View style={styles.portfoliosList}>
            {portfolios?.map((portfolio) => (
              <PortfolioAccordion
                key={portfolio.id}
                portfolio={portfolio}
                isEditing={editingPortfolio === portfolio.id}
                onDelete={contextDeletePortfolio}
                onStockDelete={contextDeleteStock}
                onEdit={() => setEditingPortfolio(portfolio.id)}
                onSave={(name) => handleUpdatePortfolio(name)}
                onCancel={() => setEditingPortfolio(null)}
                onStockPress={(stock) => setSelectedStock(stock)}
                loading={updatingPortfolio}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomSheet
        isVisible={showCreatePortfolio}
        onClose={() => {
          setShowCreatePortfolio(false);
          setPortfolioForm({ name: '' });
        }}
        title='Create Portfolio'
        snapPoints={['40%', '60%']}
      >
        <CreatePortfolioSheet
          form={portfolioForm}
          onFormChange={setPortfolioForm}
          onSubmit={handleCreatePortfolio}
          onClose={() => {
            setShowCreatePortfolio(false);
            setPortfolioForm({ name: '' });
          }}
          loading={creatingPortfolio}
        />
      </BottomSheet>

      <BottomSheet
        isVisible={showCreateStock}
        onClose={() => {
          setShowCreateStock(false);
          setStockForm({ symbol: '', shares: '', basis: '', portfolioId: '' });
        }}
        title='Add Stock'
        snapPoints={['70%', '90%']}
      >
        <CreateStockSheet
          form={stockForm}
          portfolios={portfolios}
          onFormChange={setStockForm}
          onSubmit={handleCreateStock}
          onClose={() => {
            setShowCreateStock(false);
            setStockForm({
              symbol: '',
              shares: '',
              basis: '',
              portfolioId: '',
            });
          }}
          loading={creatingStock}
        />
      </BottomSheet>

      <BottomSheet
        isVisible={!!selectedStock}
        onClose={() => setSelectedStock(null)}
        snapPoints={['60%', '90%']}
      >
        {selectedStock && <StockDetailsSheet stock={selectedStock} />}
      </BottomSheet>
    </SafeAreaView>
  );
}

function EmptyState({ onCreatePortfolio }: { onCreatePortfolio: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Start Your Investment Journey</Text>
      <Text style={styles.emptyDescription}>
        Create your first portfolio to track your stock investments and covered
        calls.
      </Text>
      <Pressable style={styles.emptyStateButton} onPress={onCreatePortfolio}>
        <Text style={styles.emptyStateButtonText}>Create Portfolio</Text>
      </Pressable>
    </View>
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
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  greeting: {
    fontSize: 32,
    fontFamily: fonts.interBold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  portfolioCount: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: '#00C805',
  },
  secondaryAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryActionText: {
    color: '#000000',
    fontSize: 16,
  },
  secondaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  portfoliosList: {
    gap: 12,
    paddingBottom: 40,
  },
  portfolioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  portfolioAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00C805',
  },
  portfolioInfo: {
    flex: 1,
  },
  portfolioName: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 2,
  },
  portfolioSubtext: {
    color: '#FFFFFF',
    opacity: 0.5,
    fontSize: 14,
  },
  portfolioStats: {
    marginTop: 8,
  },
  statLabel: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
  },
  editInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#00C805',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyDescription: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: '#00C805',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: '#000000',
    fontSize: 16,
  },
});
