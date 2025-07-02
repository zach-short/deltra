import { SvgProps } from "react-native-svg";
import { useThemeColor } from "@/hooks";
import { ComponentType } from "react";

interface ThemedIconProps extends SvgProps {
  icon: ComponentType<SvgProps>;
  lightColor?: string;
  darkColor?: string;
  size?: number;
  color?: string;
}

export const Icon = ({
  icon: IconComponent,
  lightColor,
  darkColor,
  size = 32,
  color,
  width,
  height,
  fill,
  stroke,
  ...svgProps
}: ThemedIconProps) => {
  const themeColor = useThemeColor("icon", {
    light: lightColor,
    dark: darkColor,
  });

  const resolvedColor = color || themeColor;

  return (
    <IconComponent
      width={width || size}
      height={height || size}
      fill={fill || resolvedColor}
      stroke={stroke}
      {...svgProps}
    />
  );
};

export const createThemedIcon = (IconComponent: ComponentType<SvgProps>) => {
  return (props: Omit<ThemedIconProps, "icon">) => (
    <Icon icon={IconComponent} {...props} />
  );
};
