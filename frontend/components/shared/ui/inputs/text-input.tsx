import { useState, forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { View, fonts } from '@/components';
import { useThemeColor } from '@/hooks';

interface Props extends TextInputProps {
  label?: string;
  lightColor?: string;
  darkColor?: string;
  lightBackgroundColor?: string;
  darkBackgroundColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  lightLabelColor?: string;
  darkLabelColor?: string;
  lightPlaceholderColor?: string;
  darkPlaceholderColor?: string;
}

export const TextInput = forwardRef<RNTextInput, Props>(
  (
    {
      label,
      lightColor,
      darkColor,
      lightBackgroundColor,
      darkBackgroundColor,
      lightBorderColor,
      darkBorderColor,
      lightLabelColor,
      darkLabelColor,
      lightPlaceholderColor,
      darkPlaceholderColor,
      value = '',
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = !!value;
    const shouldFloat = isFocused || hasValue;
    const labelAnimation = useSharedValue(shouldFloat ? 1 : 0);

    const backgroundColor = useThemeColor('inputBackground', {
      light: lightBackgroundColor,
      dark: darkBackgroundColor,
    });

    const borderColor = useThemeColor(isFocused ? 'borderFocused' : 'border', {
      light: lightBorderColor,
      dark: darkBorderColor,
    });

    const textColor = useThemeColor('text', {
      light: lightColor,
      dark: darkColor,
    });

    const labelColor = useThemeColor(
      isFocused ? 'labelFocused' : 'labelDefault',
      {
        light: lightLabelColor,
        dark: darkLabelColor,
      },
    );

    const placeholderColor = useThemeColor('placeholder', {
      light: lightPlaceholderColor,
      dark: darkPlaceholderColor,
    });

    const animatedLabelStyle = useAnimatedStyle(() => {
      const translateY = interpolate(labelAnimation.value, [0, 1], [20, 2]);
      const scale = interpolate(labelAnimation.value, [0, 1], [1, 0.85]);
      const fontSize = interpolate(labelAnimation.value, [0, 1], [16, 14]);
      return {
        transform: [{ translateY }, { scale }],
        fontSize,
      };
    });

    const handleFocus = (e: any) => {
      setIsFocused(true);
      labelAnimation.value = withTiming(1, { duration: 200 });
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      labelAnimation.value = withTiming(hasValue ? 1 : 0, { duration: 200 });
      onBlur?.(e);
    };

    const containerStyle = label ? styles.containerWithLabel : styles.container;
    const inputStyle = label ? styles.inputWithLabel : styles.input;

    return (
      <View style={[containerStyle, { backgroundColor }]}>
        {label && (
          <Animated.Text
            style={[
              styles.label,
              animatedLabelStyle,
              {
                color: labelColor,
                fontFamily: fonts.outfitLight,
              },
            ]}
          >
            {label}
          </Animated.Text>
        )}
        <RNTextInput
          ref={ref}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            inputStyle,
            {
              borderColor,
              color: textColor,
              fontFamily: fonts.outfitMedium,
            },
          ]}
          selectionColor='#000'
          placeholderTextColor={placeholderColor}
          {...props}
        />
      </View>
    );
  },
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerWithLabel: {
    width: '100%',
    position: 'relative',
  },
  input: {
    borderWidth: 0.75,
    borderRadius: 4,
    padding: 16,
    fontSize: 16,
    minHeight: 56,
  },
  inputWithLabel: {
    borderWidth: 0.75,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 8,
    fontSize: 16,
    minHeight: 56,
  },
  label: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
});
