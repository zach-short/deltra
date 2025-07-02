import { ScrollViewProps, ScrollView as RNScrollView } from "react-native";
import { useThemeColor } from "@/hooks";

export type ThemedScrollViewProps = ScrollViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export const ScrollView = ({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedScrollViewProps) => {
  const backgroundColor = useThemeColor("background", {
    light: lightColor,
    dark: darkColor,
  });

  return <RNScrollView style={[{ backgroundColor }, style]} {...otherProps} />;
};
