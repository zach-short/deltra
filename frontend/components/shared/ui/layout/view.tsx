import { useThemeColor } from "@/hooks";
import { View as RNView, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export const View = ({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) => {
  const backgroundColor = useThemeColor("background", {
    light: lightColor,
    dark: darkColor,
  });

  return <RNView style={[{ backgroundColor }, style]} {...otherProps} />;
};
