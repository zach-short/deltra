import { View } from '@/components';
import { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export const LoadingDots = ({
  size = 10,
  color = '#4A6741',
  delay = 200,
  duration = 800,
  containerStyle,
  height = -12,
}: {
  size?: number;
  color?: string;
  delay?: number;
  duration?: number;
  containerStyle?: ViewStyle;
  height?: number;
}) => {
  const dot1Animation = useSharedValue(0);
  const dot2Animation = useSharedValue(0);
  const dot3Animation = useSharedValue(0);

  useEffect(() => {
    dot1Animation.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      true,
    );

    dot2Animation.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        -1,
        true,
      ),
    );

    dot3Animation.value = withDelay(
      delay * 2,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        -1,
        true,
      ),
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: height * dot1Animation.value }],
    };
  });

  const dot2Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: height * dot2Animation.value }],
    };
  });

  const dot3Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: height * dot3Animation.value }],
    };
  });

  return (
    <View
      style={[styles.container, containerStyle]}
      className='!bg-transparent'
    >
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          dot3Style,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    backgroundColor: 'transparent',
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 5,
  },
});
