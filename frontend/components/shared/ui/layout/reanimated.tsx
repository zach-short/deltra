import { useThemeColor } from '@/hooks';
import Main, { type AnimatedProps } from 'react-native-reanimated';
import { type ViewProps } from 'react-native';

export type ThemedReanimatedViewProps = AnimatedProps<ViewProps> & {
  lightColor?: string;
  darkColor?: string;
};

const ThemedReanimatedView = ({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedReanimatedViewProps) => {
  const backgroundColor = useThemeColor('background', {
    light: lightColor,
    dark: darkColor,
  });

  return <Main.View style={[{ backgroundColor }, style]} {...otherProps} />;
};

export const Animated = {
  ...Main,
  View: ThemedReanimatedView,
} as typeof Main & {
  View: typeof ThemedReanimatedView;
};

export {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolate,
  Easing,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
  useDerivedValue,
  useAnimatedReaction,
  cancelAnimation,
  measure,
  scrollTo,
} from 'react-native-reanimated';
