import {
  PressableProps,
  Pressable as RNPressable,
  PressableStateCallbackType,
  ViewStyle,
} from 'react-native';
import { Text, ThemedTextProps } from '@/components';
import { useThemeColor } from '@/hooks';

interface TextPropsForPressable extends Omit<ThemedTextProps, 'children'> {}

interface CustomPressableProps extends PressableProps {
  textProps?: TextPropsForPressable;
  wrapInText?: boolean;
  lightColor?: string;
  darkColor?: string;
  lightPressedColor?: string;
  darkPressedColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  lightPressedBorderColor?: string;
  darkPressedBorderColor?: string;
  borderWidth?: number;
}

export const Pressable = ({
  children,
  textProps,
  wrapInText = true,
  lightColor,
  darkColor,
  lightPressedColor,
  darkPressedColor,
  lightBorderColor,
  darkBorderColor,
  lightPressedBorderColor,
  darkPressedBorderColor,
  borderWidth,
  style,
  ...pressableProps
}: CustomPressableProps) => {
  const backgroundColor = useThemeColor('background', {
    light: lightColor,
    dark: darkColor,
  });

  const pressedBackgroundColor = useThemeColor('tint', {
    light: lightPressedColor,
    dark: darkPressedColor,
  });

  const borderColor = useThemeColor('border', {
    light: lightBorderColor,
    dark: darkBorderColor,
  });

  const pressedBorderColor = useThemeColor('borderFocused', {
    light: lightPressedBorderColor,
    dark: darkPressedBorderColor,
  });

  const renderChildren = (state: PressableStateCallbackType) => {
    const childContent =
      typeof children === 'function' ? children(state) : children;
    if (!wrapInText) {
      return childContent;
    }
    return <Text {...textProps}>{childContent}</Text>;
  };

  const getStyleForState = (state: PressableStateCallbackType): ViewStyle => {
    const computedBorderColor =
      state.pressed && (lightPressedBorderColor || darkPressedBorderColor)
        ? pressedBorderColor
        : borderColor;

    const baseStyle: ViewStyle = {
      backgroundColor:
        state.pressed && (lightPressedColor || darkPressedColor)
          ? pressedBackgroundColor
          : backgroundColor,
      borderColor: computedBorderColor,
    };

    if (borderWidth !== undefined && borderWidth > 0) {
      baseStyle.borderWidth = borderWidth;
    }

    return baseStyle;
  };

  return (
    <RNPressable
      {...pressableProps}
      style={(state) => [
        getStyleForState(state),
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {renderChildren}
    </RNPressable>
  );
};
