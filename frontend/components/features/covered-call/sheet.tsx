import { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Pressable,
  LoadingDots,
  View,
  ScrollView,
  fonts,
} from '@/components';
import { Stock } from '@/models';
import {
  optionsService,
  OptionContract,
  OptionsChainData,
} from '@/utils/shared/api/services';

interface CreateCoveredCallForm {
  strike_price: string;
  premium_received: string;
  contracts: string;
  expiration_date: string;
  selectedContract?: OptionContract;
}

interface CreateCoveredCallSheetProps {
  form: CreateCoveredCallForm;
  stock: Stock | null;
  onFormChange: (form: CreateCoveredCallForm) => void;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
}

export function CreateCoveredCallSheet({
  form,
  stock,
  onFormChange,
  onSubmit,
  onClose,
  loading,
}: CreateCoveredCallSheetProps) {
  const [optionsData, setOptionsData] = useState<OptionsChainData | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedExpiration, setSelectedExpiration] = useState<number | null>(
    null,
  );
  const [showOptionsChain, setShowOptionsChain] = useState(false);

  const isFormValid =
    form.strike_price &&
    form.premium_received &&
    form.contracts &&
    form.expiration_date;

  useEffect(() => {
    if (stock?.symbol) {
      fetchOptionsChain();
    }
  }, [stock?.symbol]);

  const fetchOptionsChain = async () => {
    if (!stock?.symbol) return;

    setLoadingOptions(true);
    try {
      const data = await optionsService.getOptionsChain(stock.symbol);
      setOptionsData(data);
      if (data.expirationDates.length > 0) {
        setSelectedExpiration(data.expirationDates[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchOptionsForDate = async (expirationTimestamp: number) => {
    if (!stock?.symbol) return;

    setLoadingOptions(true);
    try {
      const data = await optionsService.getOptionsChainForDate(
        stock.symbol,
        expirationTimestamp,
      );
      if (data) {
        setOptionsData(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleExpirationSelect = (timestamp: number) => {
    setSelectedExpiration(timestamp);
    fetchOptionsForDate(timestamp);
  };

  const handleContractSelect = (contract: OptionContract) => {
    const expirationDate = optionsService.formatExpirationDate(
      contract.expiration,
    );
    const midPrice = ((contract.bid + contract.ask) / 2).toFixed(2);

    onFormChange({
      ...form,
      strike_price: contract.strike.toString(),
      premium_received: midPrice,
      expiration_date: expirationDate,
      selectedContract: contract,
    });
    setShowOptionsChain(false);
  };

  const filteredCalls =
    optionsData?.calls.filter(
      (call) => call.expiration === selectedExpiration,
    ) || [];

  const handleSubmit = () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!stock) {
      Alert.alert('Error', 'No stock selected');
      return;
    }

    const contractsNum = parseInt(form.contracts);
    const sharesCovered = contractsNum * 100;

    if (sharesCovered > stock.shares) {
      Alert.alert(
        'Error',
        `Insufficient shares. You have ${stock.shares} shares, but need ${sharesCovered} to cover ${contractsNum} contracts.`,
      );
      return;
    }

    onSubmit();
  };

  const maxContracts = stock ? Math.floor(stock.shares / 100) : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {stock && (
          <View style={styles.stockInfo}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockDetails}>
              {stock.shares} shares available • Max {maxContracts} contracts
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Options Chain</Text>
          <Pressable
            style={[styles.input, styles.optionsButton]}
            onPress={() => setShowOptionsChain(!showOptionsChain)}
            disabled={loadingOptions}
          >
            {loadingOptions ? (
              <LoadingDots />
            ) : (
              <Text style={styles.optionsButtonText}>
                {form.selectedContract
                  ? `${form.selectedContract.strike} Call - ${optionsService.formatExpirationDisplay(form.selectedContract.expiration)}`
                  : 'Select from options chain'}
              </Text>
            )}
          </Pressable>
        </View>

        {showOptionsChain && optionsData && (
          <View style={styles.optionsChain}>
            <Text style={styles.optionsTitle}>Select Expiration</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.expirationScroll}
            >
              {optionsData.expirationDates.map((timestamp) => (
                <Pressable
                  key={timestamp}
                  style={[
                    styles.expirationOption,
                    selectedExpiration === timestamp &&
                      styles.selectedExpiration,
                  ]}
                  onPress={() => handleExpirationSelect(timestamp)}
                >
                  <Text
                    style={[
                      styles.expirationText,
                      selectedExpiration === timestamp &&
                        styles.selectedExpirationText,
                    ]}
                  >
                    {optionsService.formatExpirationDisplay(timestamp)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.optionsTitle, { marginTop: 16 }]}>
              Call Options
            </Text>
            <ScrollView style={styles.contractsList}>
              {filteredCalls.map((contract) => (
                <Pressable
                  key={contract.contractSymbol}
                  style={styles.contractRow}
                  onPress={() => handleContractSelect(contract)}
                >
                  <View style={styles.contractInfo}>
                    <Text style={styles.contractStrike}>
                      ${contract.strike}
                    </Text>
                    <Text style={styles.contractDetails}>
                      Bid: ${contract.bid.toFixed(2)} | Ask: $
                      {contract.ask.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.contractPremium}>
                    <Text style={styles.contractPrice}>
                      ${contract.lastPrice.toFixed(2)}
                    </Text>
                    <Text style={styles.contractVolume}>
                      Vol: {contract.volume}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Strike Price</Text>
          <TextInput
            style={styles.input}
            value={form.strike_price}
            onChangeText={(strike_price) =>
              onFormChange({ ...form, strike_price })
            }
            placeholder='e.g., 150.00'
            keyboardType='decimal-pad'
            placeholderTextColor='rgba(255, 255, 255, 0.5)'
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Premium per Share</Text>
          <TextInput
            style={styles.input}
            value={form.premium_received}
            onChangeText={(premium_received) =>
              onFormChange({ ...form, premium_received })
            }
            placeholder='e.g., 2.50'
            keyboardType='decimal-pad'
            placeholderTextColor='rgba(255, 255, 255, 0.5)'
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Number of Contracts</Text>
          <TextInput
            style={styles.input}
            value={form.contracts}
            onChangeText={(contracts) => onFormChange({ ...form, contracts })}
            placeholder={`Max ${maxContracts}`}
            keyboardType='numeric'
            placeholderTextColor='rgba(255, 255, 255, 0.5)'
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Expiration Date</Text>
          <TextInput
            style={styles.input}
            value={
              form.expiration_date.includes('T')
                ? form.expiration_date.split('T')[0]
                : form.expiration_date
            }
            onChangeText={(dateInput) => {
              let formattedDate = dateInput;
              if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
                formattedDate = `${dateInput}T21:00:00.000Z`;
              }
              onFormChange({ ...form, expiration_date: formattedDate });
            }}
            placeholder='YYYY-MM-DD'
            placeholderTextColor='rgba(255, 255, 255, 0.5)'
          />
        </View>

        {form.premium_received && form.contracts && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Income Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Premium:</Text>
              <Text style={styles.summaryValue}>
                $
                {(
                  parseFloat(form.premium_received || '0') *
                  parseInt(form.contracts || '0') *
                  100
                ).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shares Covered:</Text>
              <Text style={styles.summaryValue}>
                {parseInt(form.contracts || '0') * 100}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.primaryButton,
            !isFormValid && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading || !isFormValid}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Creating...' : 'Sell Call'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    marginBottom: 24,
  },
  stockInfo: {
    backgroundColor: 'rgba(0, 200, 5, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 5, 0.2)',
  },
  stockSymbol: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interBold,
    marginBottom: 4,
  },
  stockDetails: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
    fontFamily: fonts.interRegular,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontFamily: fonts.interRegular,
  },
  summary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
    marginBottom: 12,
  },
  summaryRow: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.interRegular,
  },
  summaryValue: {
    color: '#00C805',
    fontSize: 16,
    fontFamily: fonts.interBold,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButton: {
    backgroundColor: '#00C805',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 200, 5, 0.3)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  optionsButton: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
  },
  optionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interRegular,
    opacity: 0.8,
  },
  optionsChain: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: 400,
  },
  optionsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
    marginBottom: 12,
  },
  expirationScroll: {
    marginBottom: 16,
  },
  expirationOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedExpiration: {
    backgroundColor: '#00C805',
    borderColor: '#00C805',
  },
  expirationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.interMedium,
  },
  selectedExpirationText: {
    color: '#000000',
  },
  contractsList: {
    maxHeight: 200,
  },
  contractRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contractInfo: {
    flex: 1,
  },
  contractStrike: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interBold,
    marginBottom: 2,
  },
  contractDetails: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 12,
    fontFamily: fonts.interRegular,
  },
  contractPremium: {
    alignItems: 'flex-end',
  },
  contractPrice: {
    color: '#00C805',
    fontSize: 16,
    fontFamily: fonts.interBold,
    marginBottom: 2,
  },
  contractVolume: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 12,
    fontFamily: fonts.interRegular,
  },
});
