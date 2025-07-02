import { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { calculateFormProgress, ProgressConfig } from "@/lib/form";
import { View } from "../layout";

interface ProgressBarProps {
  formData: any;
  progressConfig: ProgressConfig;
  barStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  animationDuration?: number;
}

export const ProgressBar = ({
  formData,
  progressConfig,
  barStyle,
  containerStyle,
  animationDuration = 300,
}: ProgressBarProps) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percentComplete = calculateFormProgress(progressConfig, formData);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentComplete,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [percentComplete, animationDuration]);

  return (
    <View className="w-full h-1 bg-gray-200" style={containerStyle}>
      <Animated.View
        className="h-full bg-black"
        style={{
          width: animatedWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
          }),
          ...barStyle,
        }}
      />
    </View>
  );
};
