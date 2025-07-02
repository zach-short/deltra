import { useThemeColor } from "@/hooks";
import Reanimated, { type AnimatedProps } from "react-native-reanimated";
import { type ViewProps } from "react-native";

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
  const backgroundColor = useThemeColor("background", {
    light: lightColor,
    dark: darkColor,
  });

  return (
    <Reanimated.View style={[{ backgroundColor }, style]} {...otherProps} />
  );
};

const ReanimatedAnimated = {
  ...Reanimated,
  View: ThemedReanimatedView,
} as typeof Reanimated & {
  View: typeof ThemedReanimatedView;
};

export default ReanimatedAnimated;

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
} from "react-native-reanimated";
