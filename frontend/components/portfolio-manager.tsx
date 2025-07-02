import { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@/context/auth';
import { Text, View, TextInput } from '@/components';
import { Portfolio } from '@/models';

export function PortfolioManager() {
  const { user, fetchWithAuth } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showCreateStock, setShowCreateStock] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [editingPortfolio, setEditingPortfolio] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [stockSymbol, setStockSymbol] = useState('');
  const [stockShares, setStockShares] = useState('');
  const [stockBasis, setStockBasis] = useState('');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `http://localhost:8080/v1/users/${user?.id}/portfolios`,
        { method: 'GET' },
      );

      if (response.ok) {
        const data = await response.json();
        setPortfolios(data || []);
      } else {
        console.error('Failed to fetch portfolios');
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async (name: string) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/v1/users/${user?.id}/portfolios`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        },
      );

      if (response.ok) {
        const newPortfolio = await response.json();
        setPortfolios([...portfolios, newPortfolio]);
        return newPortfolio;
      } else {
        Alert.alert('Error', 'Failed to create portfolio');
        return null;
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      Alert.alert('Error', 'Failed to create portfolio');
      return null;
    }
  };

  const updatePortfolio = async (id: string, name: string) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/v1/users/${user?.id}/portfolios/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        },
      );

      if (response.ok) {
        setPortfolios(
          portfolios.map((p) => (p.id === id ? { ...p, name } : p)),
        );
        setEditingPortfolio(null);
      } else {
        Alert.alert('Error', 'Failed to update portfolio');
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
      Alert.alert('Error', 'Failed to update portfolio');
    }
  };

  const createStock = async () => {
    if (!stockSymbol || !stockShares || !stockBasis) {
      Alert.alert('Error', 'Please fill in all stock fields');
      return;
    }

    try {
      let portfolioId = selectedPortfolioId;

      if (!portfolioId && portfolios.length === 0) {
        const defaultPortfolio = await createPortfolio('Portfolio 1');
        if (!defaultPortfolio) return;
        portfolioId = defaultPortfolio.id;
      } else if (!portfolioId) {
        portfolioId = portfolios[0].id;
      }

      const response = await fetchWithAuth(
        `http://localhost:8080/v1/users/${user?.id}/stocks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: stockSymbol.toUpperCase(),
            shares: parseInt(stockShares),
            basis: parseFloat(stockBasis),
            portfolio_id: portfolioId,
          }),
        },
      );

      if (response.ok) {
        Alert.alert('Success', 'Stock created successfully');
        setStockSymbol('');
        setStockShares('');
        setStockBasis('');
        setSelectedPortfolioId('');
        setShowCreateStock(false);
        fetchPortfolios();
      } else {
        Alert.alert('Error', 'Failed to create stock');
      }
    } catch (error) {
      console.error('Error creating stock:', error);
      Alert.alert('Error', 'Failed to create stock');
    }
  };

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) {
      Alert.alert('Error', 'Please enter a portfolio name');
      return;
    }

    await createPortfolio(newPortfolioName.trim());
    setNewPortfolioName('');
    setShowCreatePortfolio(false);
  };

  const handleUpdatePortfolio = async () => {
    if (!editingName.trim()) {
      Alert.alert('Error', 'Please enter a portfolio name');
      return;
    }

    if (editingPortfolio) {
      await updatePortfolio(editingPortfolio, editingName.trim());
      setEditingName('');
    }
  };

  const startEditing = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio.id);
    setEditingName(portfolio.name);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' />
        <Text>Loading portfolios...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text type='title' style={styles.title}>
        Your Portfolios
      </Text>

      {portfolios.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No portfolios yet. Create your first portfolio or add a stock to get
            started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={portfolios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.portfolioCard}>
              {editingPortfolio === item.id ? (
                <View style={styles.editForm}>
                  <TextInput
                    style={styles.editInput}
                    value={editingName}
                    onChangeText={setEditingName}
                    placeholder='Portfolio name'
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton]}
                      onPress={handleUpdatePortfolio}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => setEditingPortfolio(null)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => startEditing(item)}
                  style={styles.portfolioHeader}
                >
                  <Text type='subtitle'>{item.name}</ThemedText>
                  <Text style={styles.editHint}>Tap to rename</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setShowCreatePortfolio(true)}
        >
          <Text style={styles.buttonText}>Create Portfolio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setShowCreateStock(true)}
        >
          <Text style={styles.buttonText}>Add Stock</Text>
        </TouchableOpacity>
      </View>

      {/* Create Portfolio Modal */}
      {showCreatePortfolio && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text type='subtitle'>Create New Portfolio</ThemedText>
            <TextInput
              style={styles.input}
              value={newPortfolioName}
              onChangeText={setNewPortfolioName}
              placeholder='Portfolio name'
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleCreatePortfolio}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowCreatePortfolio(false);
                  setNewPortfolioName('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Create Stock Modal */}
      {showCreateStock && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text type='subtitle'>Add New Stock</ThemedText>

            <TextInput
              style={styles.input}
              value={stockSymbol}
              onChangeText={setStockSymbol}
              placeholder='Stock Symbol (e.g., AAPL)'
              autoCapitalize='characters'
              autoFocus
            />

            <TextInput
              style={styles.input}
              value={stockShares}
              onChangeText={setStockShares}
              placeholder='Number of Shares'
              keyboardType='numeric'
            />

            <TextInput
              style={styles.input}
              value={stockBasis}
              onChangeText={setStockBasis}
              placeholder='Cost Basis (per share)'
              keyboardType='decimal-pad'
            />

            {portfolios.length > 0 && (
              <View style={styles.portfolioSelector}>
                <Text>Select Portfolio:</ThemedText>
                <FlatList
                  data={portfolios}
                  horizontal
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.portfolioOption,
                        selectedPortfolioId === item.id &&
                          styles.selectedPortfolio,
                      ]}
                      onPress={() => setSelectedPortfolioId(item.id)}
                    >
                      <Text
                        style={[
                          styles.portfolioOptionText,
                          selectedPortfolioId === item.id &&
                            styles.selectedPortfolioText,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {portfolios.length === 0 && (
              <Text style={styles.defaultPortfolioText}>
                A default portfolio will be created for this stock
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={createStock}
              >
                <Text style={styles.buttonText}>Add Stock</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowCreateStock(false);
                  setStockSymbol('');
                  setStockShares('');
                  setStockBasis('');
                  setSelectedPortfolioId('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
  portfolioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  portfolioHeader: {
    alignItems: 'center',
  },
  editHint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  editForm: {
    gap: 12,
  },
  editInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  portfolioSelector: {
    gap: 8,
  },
  portfolioOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedPortfolio: {
    backgroundColor: '#007AFF',
  },
  portfolioOptionText: {
    color: '#333',
  },
  selectedPortfolioText: {
    color: 'white',
  },
  defaultPortfolioText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

