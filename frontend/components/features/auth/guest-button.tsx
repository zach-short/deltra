import { Pressable, Text } from '@/components';

export function ContinueAsGuestButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Text
        style={{
          width: '100%',
          height: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 5,
          backgroundColor: '#f8f9fa',
          borderWidth: 1,
          borderColor: '#e9ecef',
        }}
      >
        Continue as Guest
      </Text>
    </Pressable>
  );
}

