import { Pressable, PressableProps } from 'react-native';
import { router } from 'expo-router';
import { LeftArrowWithTailIcon } from '@/icons';
import { Icon } from '@/components/shared/icons';
import { ComponentProps } from 'react';

interface BackArrowProps extends Omit<PressableProps, 'onPress'> {
  iconProps?: ComponentProps<typeof Icon>;
  onPress?: () => void;
}

export const BackArrow = ({
  iconProps = { height: 40, width: 40, icon: LeftArrowWithTailIcon },
  onPress,
  ...pressableProps
}: BackArrowProps) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable onPress={handlePress} {...pressableProps}>
      <Icon {...iconProps} />
    </Pressable>
  );
};
