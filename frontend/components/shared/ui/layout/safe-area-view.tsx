import { useThemeColor } from "@/hooks";
import { SafeAreaView as RNSafeAreaView, type ViewProps } from "react-native";

export type ThemedSafeAreaViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export const SafeAreaView = ({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedSafeAreaViewProps) => {
  const backgroundColor = useThemeColor("background", {
    light: lightColor,
    dark: darkColor,
  });

  return (
    <RNSafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />
  );
};
