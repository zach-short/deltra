import { useThemeColor } from "@/hooks";
import { Text as RNText, TextStyle, type TextProps } from "react-native";
import { fonts } from "./fonts";

export type FontFamily = keyof typeof fonts | string;
export type Weight = "thin" | "light" | "regular" | "bold" | "medium";
export type TextType =
  | "default"
  | "title"
  | "defaultSemiBold"
  | "subtitle"
  | "link";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  font?: FontFamily;
  weight?: Weight;
  type?: TextType;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
};

export const Text = ({
  lightColor,
  darkColor,
  font = "outfitMedium",
  weight,
  type = "default",
  style,
  children,
  ...rest
}: ThemedTextProps) => {
  const color = useThemeColor("text", {
    light: lightColor,
    dark: darkColor,
  });

  let fontFamily = fonts[font as keyof typeof fonts] || font;

  if (weight) {
    const fontPrefix = (font as string).replace(
      /Thin|Light|Regular|Bold|Medium/g,
      "",
    );
    const weightMap = {
      thin: "Thin",
      light: "Light",
      regular: "Regular",
      bold: "Bold",
      medium: "Medium",
    };
    const newFontKey = `${fontPrefix}${weightMap[weight]}`;
    if (fonts[newFontKey as keyof typeof fonts]) {
      fontFamily = fonts[newFontKey as keyof typeof fonts];
    }
  }

  return (
    <RNText style={[{ color, fontFamily }, style]} {...rest}>
      {children}
    </RNText>
  );
};
