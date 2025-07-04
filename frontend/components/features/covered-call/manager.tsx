import { StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { CoveredCall, Stock } from '@/models';
import {
  Pressable,
  fonts,
  View,
  Text,
  TextInput,
  ScrollView,
  BottomSheet,
  CreateCoveredCallSheet,
} from '@/components';
import { useCoveredCall, usePortfolio, useStock } from '@/context';
import { CreateCoveredCallForm } from '@/app/s/[id]';

interface CoveredCallManagerProps {
  stock: Stock;
  onClose: () => void;
}

interface BuyToCloseForm {
  buyback_premium: string;
  buyback_date: string;
}

export function CoveredCallManager({
  stock,
  onClose,
}: CoveredCallManagerProps) {
  const { updateCoveredCall, createCoveredCall, refreshCoveredCalls } =
    useCoveredCall();
  const { refreshPortfolios } = usePortfolio();
  const [selectedCall, setSelectedCall] = useState<CoveredCall | null>(null);
  const [showCreateCoveredCall, setShowCreateCoveredCall] = useState(false);
  const [buyToCloseForm, setBuyToCloseForm] = useState<BuyToCloseForm>({
    buyback_premium: '',
    buyback_date: new Date().toISOString().split('T')[0],
  });
  const { creatingCoveredCall } = useStock();

  const [coveredCallForm, setCoveredCallForm] = useState<CreateCoveredCallForm>(
    {
      strike_price: '',
      premium_received: '',
      contracts: '',
      expiration_date: '',
    },
  );
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

  const [loading, setLoading] = useState(false);

  const activeCalls =
    stock.covered_calls?.filter((call) => call.status === 'active') || [];
  const expiredCalls =
    stock.covered_calls?.filter((call) => call.status === 'expired') || [];
  const assignedCalls =
    stock.covered_calls?.filter((call) => call.status === 'assigned') || [];
  const closedCalls =
    stock.covered_calls?.filter((call) => call.status === 'bought_back') || [];

  const handleBuyToClose = async () => {
    if (!selectedCall) return;

    const { buyback_premium, buyback_date } = buyToCloseForm;

    if (!buyback_premium || !buyback_date) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const buybackPremium = parseFloat(buyback_premium);
    if (isNaN(buybackPremium) || buybackPremium < 0) {
      Alert.alert('Error', 'Please enter a valid buyback premium');
      return;
    }

    setLoading(true);
    try {
      const result = await updateCoveredCall(selectedCall.id, {
        status: 'bought_back',
        buyback_premium: buybackPremium,
        buyback_date: buyback_date,
      });

      if (result) {
        setSelectedCall(null);
        setBuyToCloseForm({
          buyback_premium: '',
          buyback_date: new Date().toISOString().split('T')[0],
        });

        // Refresh portfolios to update calculations
        await refreshPortfolios();

        Alert.alert('Success', 'Covered call bought to close successfully');
      } else {
        Alert.alert('Error', 'Failed to update covered call');
      }
    } catch (error) {
      console.error('Error buying to close:', error);
      Alert.alert('Error', 'Failed to buy to close');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkExpired = async (call: CoveredCall) => {
    Alert.alert(
      'Mark as Expired',
      'Are you sure you want to mark this call as expired?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Expired',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateCoveredCall(call.id, {
                status: 'expired',
              });
              await refreshPortfolios();
              Alert.alert('Success', 'Call marked as expired');
            } catch (error) {
              Alert.alert('Error', 'Failed to mark as expired');
            }
          },
        },
      ],
    );
  };

  const handleMarkAssigned = async (call: CoveredCall) => {
    Alert.alert(
      'Mark as Assigned',
      'Are you sure you want to mark this call as assigned?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Assigned',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateCoveredCall(call.id, {
                status: 'assigned',
                assignment_date: new Date().toISOString().split('T')[0],
                assignment_price: call.strike_price,
              });
              await refreshPortfolios();
              Alert.alert('Success', 'Call marked as assigned');
            } catch (error) {
              Alert.alert('Error', 'Failed to mark as assigned');
            }
          },
        },
      ],
    );
  };

  const calculateProfitLoss = (call: CoveredCall) => {
    if (call.status === 'bought_back' && call.buyback_premium !== null) {
      const netPremium = call.premium_received - call.buyback_premium;
      const totalNet = netPremium * call.contracts * 100;
      return {
        amount: totalNet,
        color: totalNet >= 0 ? '#00C805' : '#FF4444',
        label: totalNet >= 0 ? 'Profit' : 'Loss',
      };
    }
    return {
      amount: call.total_premium,
      color: '#00C805',
      label: 'Premium',
    };
  };

  const CallCard = ({
    call,
    showActions = true,
  }: {
    call: CoveredCall;
    showActions?: boolean;
  }) => {
    const profitLoss = calculateProfitLoss(call);
    const daysToExpiry = Math.ceil(
      (new Date(call.expiration_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return (
      <View style={styles.callCard}>
        <View style={styles.callHeader}>
          <View style={styles.callInfo}>
            <Text style={styles.callStrike}>${call.strike_price}</Text>
            <Text style={styles.callDetails}>
              {call.contracts} contracts •{' '}
              {new Date(call.expiration_date).toLocaleDateString()}
            </Text>
            {call.status === 'active' && daysToExpiry > 0 && (
              <Text style={styles.callExpiry}>
                {daysToExpiry} days to expiry
              </Text>
            )}
          </View>
          <View style={styles.callValue}>
            <Text style={[styles.callAmount, { color: profitLoss.color }]}>
              ${Math.abs(profitLoss.amount).toFixed(2)}
            </Text>
            <Text style={styles.callLabel}>{profitLoss.label}</Text>
          </View>
        </View>

        {showActions && call.status === 'active' && (
          <View style={styles.callActions}>
            <Pressable
              style={[styles.actionButton, styles.buyBackButton]}
              onPress={() => setSelectedCall(call)}
            >
              <Text style={styles.actionButtonText}>Buy to Close</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.expiredButton]}
              onPress={() => handleMarkExpired(call)}
            >
              <Text style={styles.actionButtonText}>Mark Expired</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.assignedButton]}
              onPress={() => handleMarkAssigned(call)}
            >
              <Text style={styles.actionButtonText}>Mark Assigned</Text>
            </Pressable>
          </View>
        )}

        {call.status === 'bought_back' && (
          <View style={styles.callFooter}>
            <Text style={styles.callFooterText}>
              Bought back at ${call.buyback_premium?.toFixed(2)} on{' '}
              {call.buyback_date
                ? new Date(call.buyback_date).toLocaleDateString()
                : 'N/A'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            {activeCalls.length} active • {stock.shares_available} shares
            available
          </Text>
          {stock.shares_available >= 100 && (
            <Pressable
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={() => setShowCreateCoveredCall(true)}
              wrapInText={false}
            >
              <Text style={[styles.primaryActionButtonText]}>
                Sell Covered Call
              </Text>
            </Pressable>
          )}
        </View>

        {activeCalls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Calls</Text>
            <View style={styles.callsList}>
              {activeCalls.map((call) => (
                <CallCard key={call.id} call={call} />
              ))}
            </View>
          </View>
        )}

        {expiredCalls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expired Calls</Text>
            <View style={styles.callsList}>
              {expiredCalls.map((call) => (
                <CallCard key={call.id} call={call} showActions={false} />
              ))}
            </View>
          </View>
        )}

        {assignedCalls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Calls</Text>
            <View style={styles.callsList}>
              {assignedCalls.map((call) => (
                <CallCard key={call.id} call={call} showActions={false} />
              ))}
            </View>
          </View>
        )}

        {closedCalls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Closed Calls</Text>
            <View style={styles.callsList}>
              {closedCalls.map((call) => (
                <CallCard key={call.id} call={call} showActions={false} />
              ))}
            </View>
          </View>
        )}

        {selectedCall && (
          <View style={styles.buyToCloseModal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Buy to Close</Text>
              <Text style={styles.modalSubtitle}>
                ${selectedCall.strike_price} Call • {selectedCall.contracts}{' '}
                contracts
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Buyback Premium (per share)</Text>
                <TextInput
                  style={styles.input}
                  value={buyToCloseForm.buyback_premium}
                  onChangeText={(text) =>
                    setBuyToCloseForm((prev) => ({
                      ...prev,
                      buyback_premium: text,
                    }))
                  }
                  placeholder='0.00'
                  keyboardType='numeric'
                  placeholderTextColor='#666'
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Buyback Date</Text>
                <TextInput
                  style={styles.input}
                  value={buyToCloseForm.buyback_date}
                  onChangeText={(text) =>
                    setBuyToCloseForm((prev) => ({
                      ...prev,
                      buyback_date: text,
                    }))
                  }
                  placeholder='YYYY-MM-DD'
                  placeholderTextColor='#666'
                />
              </View>

              {buyToCloseForm.buyback_premium && (
                <View style={styles.calculationCard}>
                  <Text style={styles.calculationLabel}>Net Premium</Text>
                  <Text style={styles.calculationValue}>
                    $
                    {(
                      (selectedCall.premium_received -
                        parseFloat(buyToCloseForm.buyback_premium || '0')) *
                      selectedCall.contracts *
                      100
                    ).toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setSelectedCall(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleBuyToClose}
                  disabled={loading}
                >
                  <Text style={styles.confirmButtonText}>
                    {loading ? 'Processing...' : 'Buy to Close'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
    </>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interBold,
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 14,
    fontFamily: fonts.interRegular,
    marginBottom: 16,
    lineHeight: 20,
  },
  callsList: {
    gap: 12,
  },
  callCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  callInfo: {
    flex: 1,
  },
  callStrike: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interBold,
    marginBottom: 4,
  },
  callDetails: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
    fontFamily: fonts.interRegular,
    marginBottom: 2,
  },
  callExpiry: {
    color: '#FF9500',
    fontSize: 12,
    fontFamily: fonts.interMedium,
  },
  callValue: {
    alignItems: 'flex-end',
  },
  callAmount: {
    fontSize: 16,
    fontFamily: fonts.interBold,
    marginBottom: 2,
  },
  callLabel: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
    fontFamily: fonts.interRegular,
  },
  callActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyBackButton: {
    backgroundColor: '#007AFF',
  },
  expiredButton: {
    backgroundColor: '#FF9500',
  },
  assignedButton: {
    backgroundColor: '#FF3B30',
  },
  activateButton: {
    backgroundColor: '#00C805',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.interMedium,
  },
  callFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  callFooterText: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
    fontFamily: fonts.interRegular,
  },
  buyToCloseModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: fonts.interBold,
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
    fontFamily: fonts.interRegular,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.interMedium,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interRegular,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calculationCard: {
    backgroundColor: 'rgba(0, 200, 5, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculationLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.interMedium,
  },
  calculationValue: {
    color: '#00C805',
    fontSize: 16,
    fontFamily: fonts.interBold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  primaryActionButton: {
    backgroundColor: '#00C805',
    marginTop: 10,
  },
  primaryActionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
});
