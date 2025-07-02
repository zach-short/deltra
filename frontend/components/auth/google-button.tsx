import { Image } from 'react-native';
import { Pressable, View, Text } from '../shared';

export default function SignInWithGoogleButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <View
        style={{
          width: '100%',
          height: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 5,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ccc',
        }}
      >
        <Image
          source={require('../assets/images/google-icon.png')}
          style={{
            width: 18,
            height: 18,
            marginRight: 6,
          }}
        />
        <Text type='defaultSemiBold' darkColor='#000'>
          Continue with Google
        </Text>
      </View>
    </Pressable>
  );
}
