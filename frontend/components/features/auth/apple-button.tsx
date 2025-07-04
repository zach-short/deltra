import { Image, StyleSheet } from 'react-native';
import { useAuth } from '@/context/auth';
import { Pressable, Text, View } from '@/components';

export function SignInWithAppleButton() {
  const { signInWithAppleWebBrowser } = useAuth();

  return (
    <Pressable wrapInText={false} onPress={signInWithAppleWebBrowser}>
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/apple-icon.png')}
          style={styles.icon}
        />
        <Text type='defaultSemiBold' darkColor='#fff' lightColor='#fff'>
          Continue with Apple
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#000',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
});
