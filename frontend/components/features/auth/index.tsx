import { useAuth } from '@/context';
import { StyleSheet } from 'react-native';
import { View } from '@/components';
import { SignInWithGoogleButton } from './google-button';
import { SignInWithAppleButton } from './apple-button';
import { ContinueAsGuestButton } from './guest-button';

export function LoginForm() {
  const { signIn, signInAsGuest, isLoading } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.buttonContainer}>
          <SignInWithGoogleButton onPress={signIn} disabled={isLoading} />
          <SignInWithAppleButton />
          <ContinueAsGuestButton onPress={signInAsGuest} disabled={isLoading} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 12,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  contentContainer: {
    width: '100%',
    gap: 32,
  },
  title: {
    textAlign: 'center',
    fontSize: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});
