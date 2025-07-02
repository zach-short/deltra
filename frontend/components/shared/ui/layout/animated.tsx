import { useThemeColor } from '@/hooks';
import { type ViewProps } from 'react-native';
import RNAnimated from 'react-native-reanimated';

export type ThemedAnimatedViewProps = RNAnimated.AnimateProps<ViewProps> & {
  lightColor?: string;
  darkColor?: string;
};

const ThemedAnimatedView = ({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedAnimatedViewProps) => {
  const backgroundColor = useThemeColor('background', {
    light: lightColor,
    dark: darkColor,
  });

  return (
    <RNAnimated.View style={[{ backgroundColor }, style]} {...otherProps} />
  );
};

export const Animated = {
  ...RNAnimated,
  View: ThemedAnimatedView,
} as typeof RNAnimated & {
  View: typeof ThemedAnimatedView;
};
