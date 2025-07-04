import { StyleSheet, Alert } from 'react-native';
import { fonts, View, Text, TextInput, Pressable } from '@/components';

interface CreatePortfolioForm {
  name: string;
}

interface CreatePortfolioSheetProps {
  form: CreatePortfolioForm;
  onFormChange: (form: CreatePortfolioForm) => void;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
}

export function CreatePortfolioSheet({
  form,
  onFormChange,
  onSubmit,
  onClose,
  loading,
}: CreatePortfolioSheetProps) {
  const handleSubmit = () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Please enter a portfolio name');
      return;
    }
    onSubmit();
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Portfolio Name</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(name) => onFormChange({ ...form, name })}
          placeholder='Enter portfolio name'
          autoFocus
          autoCapitalize='words'
          placeholderTextColor='rgba(255, 255, 255, 0.5)'
        />

        <Text style={styles.description}>
          Create a new portfolio to organize your stock investments and track
          covered calls.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
          disabled={loading}
          wrapInText={false}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.primaryButton,
            !form.name.trim() && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          wrapInText={false}
          disabled={loading || !form.name.trim()}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Creating...' : 'Create Portfolio'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
    marginBottom: 24,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
    fontFamily: fonts.interRegular,
  },
  description: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.interRegular,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
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
