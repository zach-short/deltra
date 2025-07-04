import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { fonts, Text, TextInput, Pressable } from '@/components';
import { Portfolio } from '@/models';

interface CreateStockForm {
  symbol: string;
  shares: string;
  basis: string;
  portfolioId: string;
}

interface CreateStockSheetProps {
  form: CreateStockForm;
  portfolios: Portfolio[] | null;
  onFormChange: (form: CreateStockForm) => void;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
}

export function CreateStockSheet({
  form,
  portfolios,
  onFormChange,
  onSubmit,
  onClose,
  loading,
}: CreateStockSheetProps) {
  const isFormValid = form.symbol && form.shares && form.basis;

  const handleSubmit = () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    onSubmit();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Stock Symbol</Text>
          <TextInput
            style={styles.input}
            value={form.symbol}
            onChangeText={(symbol) => onFormChange({ ...form, symbol })}
            placeholder='e.g., AAPL'
            autoCapitalize='characters'
            autoCorrect={false}
            placeholderTextColor='rgba(255, 255, 255, 0.5)'
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Number of Shares</Text>
          <TextInput
            style={styles.input}
            value={form.shares}
            onChangeText={(shares) => onFormChange({ ...form, shares })}
            placeholder='e.g., 100'
            keyboardType='numeric'
            placeholderTextColor='rgba(255, 255, 255, 0.5)'
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Cost Basis per Share</Text>
          <TextInput
            style={styles.input}
            value={form.basis}
            onChangeText={(basis) => onFormChange({ ...form, basis })}
            placeholder='e.g., 150.00'
            keyboardType='decimal-pad'
            placeholderTextColor='rgba(255, 255, 255, 0.5)'
          />
        </View>

        {portfolios && portfolios.length > 0 && (
          <View style={styles.field}>
            <Text style={styles.label}>Portfolio</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.portfolioScroll}
            >
              {portfolios.map((portfolio) => (
                <Pressable
                  key={portfolio.id}
                  style={[
                    styles.portfolioOption,
                    form.portfolioId === portfolio.id && styles.selectedOption,
                  ]}
                  onPress={() =>
                    onFormChange({ ...form, portfolioId: portfolio.id })
                  }
                >
                  <Text
                    style={[
                      styles.portfolioOptionText,
                      form.portfolioId === portfolio.id &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {portfolio.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {portfolios && portfolios.length === 0 && (
          <View style={styles.autoCreateNote}>
            <Text style={styles.autoCreateText}>
              A default portfolio will be created automatically
            </Text>
          </View>
        )}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Investment Summary</Text>
          {form.shares && form.basis && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Investment:</Text>
              <Text style={styles.summaryValue}>
                $
                {(
                  parseFloat(form.shares || '0') * parseFloat(form.basis || '0')
                ).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
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
            {loading ? 'Adding...' : 'Add Stock'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    marginBottom: 24,
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
  portfolioScroll: {
    marginTop: 4,
  },
  portfolioOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedOption: {
    backgroundColor: '#00C805',
    borderColor: '#00C805',
  },
  portfolioOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.interMedium,
  },
  selectedOptionText: {
    color: '#000000',
  },
  autoCreateNote: {
    backgroundColor: 'rgba(0, 200, 5, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 5, 0.2)',
    marginBottom: 20,
  },
  autoCreateText: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 14,
    textAlign: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
    fontFamily: fonts.interRegular,
  },
  summaryValue: {
    color: '#00C805',
    fontSize: 18,
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
});
