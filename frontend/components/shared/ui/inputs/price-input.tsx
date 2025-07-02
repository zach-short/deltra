import { fonts, Text, View } from "@/components/shared";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  TextStyle,
} from "react-native";

interface Props {
  label: string;
  value?: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: TextStyle;
  maxLength?: number;
  placeholderTextColor?: string;
  className?: string;
  selectionColor?: string;
}

export function PriceInput({
  label,
  value = "",
  onChangeText,
  placeholder,
  style,
  maxLength,
  className,
  placeholderTextColor = "#e4e4e7",
  selectionColor = "black",
}: Props) {
  const [isFocused, setIsFocused] = useState(!!value);
  const [displayValue, setDisplayValue] = useState("0.00");
  const [error, setError] = useState<string | null>(null);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  const [digits, setDigits] = useState<string[]>(["0", "0", "0", "0", "0"]);

  const MIN_PRICE_CENTS = 1;
  const MAX_PRICE_CENTS = 999999;

  const getCentsValue = (): number => {
    return parseInt(digits.join(""), 10);
  };

  const formatForDisplay = (centsValue: number): string => {
    const dollars = (centsValue / 100).toFixed(2);

    if (centsValue >= 100000) {
      const parts = dollars.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }

    return dollars;
  };

  const validatePrice = (centsValue: number): boolean => {
    if (centsValue < MIN_PRICE_CENTS) {
      setError("Price must be between $0.01 and $9,999.99");
      return false;
    } else if (centsValue > MAX_PRICE_CENTS) {
      setError("Price must be between $0.01 and $9,999.99");
      return false;
    } else {
      setError(null);
      return true;
    }
  };

  const updateValue = (newDigits: string[]) => {
    setDigits(newDigits);
    const centsValue = parseInt(newDigits.join(""), 10);
    setDisplayValue(formatForDisplay(centsValue));
    validatePrice(centsValue);
    onChangeText(centsValue.toString());
  };

  const addDigit = (newDigit: string) => {
    const newDigits = [...digits.slice(1), newDigit];

    const potentialValue = parseInt(newDigits.join(""), 10);
    if (potentialValue > MAX_PRICE_CENTS) {
      setError("Price must be between $0.01 and $9,999.99");
      return;
    }

    updateValue(newDigits);
  };

  const removeDigit = () => {
    const newDigits = ["0", ...digits.slice(0, -1)];
    updateValue(newDigits);
  };

  const handleTextChange = (text: string) => {};

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    const key = e.nativeEvent.key;

    if (key === "Backspace") {
      removeDigit();
      e.preventDefault?.();
      return;
    }

    if (/^[0-9]$/.test(key)) {
      addDigit(key);
      e.preventDefault?.();
      return;
    }

    if (key === ".") {
      e.preventDefault?.();
      return;
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    const centsValue = getCentsValue();
    setDisplayValue(formatForDisplay(centsValue));
    validatePrice(centsValue);
    onChangeText(centsValue.toString());
  };

  useEffect(() => {
    if (value) {
      setIsFocused(true);
      Animated.timing(labelAnimation, {
        toValue: 1,
        duration: 0,
        useNativeDriver: false,
      }).start();

      const numericValue = parseInt(value, 10);

      validatePrice(numericValue);

      const limitedValue = Math.min(numericValue, MAX_PRICE_CENTS);

      const paddedValue = limitedValue.toString().padStart(6, "0");

      const digitsToUse =
        paddedValue.length > 6
          ? paddedValue.slice(-6).split("")
          : paddedValue.split("");

      setDigits(digitsToUse);
      setDisplayValue(formatForDisplay(limitedValue));
    } else {
      setDigits(["0", "0", "0", "0", "0", "0"]);
      setDisplayValue("0.00");
      setError(null);
    }
  }, [value]);

  const labelStyle: Animated.WithAnimatedObject<TextStyle> = {
    position: "absolute",
    left: 8,
    color: isFocused ? "#000" : "#A9A9A9",
    transform: [
      {
        translateY: labelAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 2],
        }),
      },
      {
        scaleY: labelAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.9],
        }),
      },
      {
        scaleX: labelAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.9],
        }),
      },
    ],
    fontSize: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 16],
    }),
  };

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[{ fontFamily: fonts.outfitThin }, styles.label, labelStyle]}
      >
        {label}
      </Animated.Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.priceDollarSign}>$</Text>
        <TextInput
          ref={inputRef}
          value={displayValue}
          style={[styles.input, error ? styles.inputError : {}, style]}
          className={`border rounded ${className}`}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          maxLength={maxLength}
          keyboardType="number-pad"
          selectionColor={selectionColor}
          contextMenuHidden={true}
        />
        <Text style={styles.priceDollarSign}>$</Text>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#A9A9A9",
    padding: 20,
    paddingLeft: 10,
    fontSize: 20,
    height: 64,
    minWidth: 150,
    textAlign: "right",
    paddingRight: 20,
  },
  inputError: {
    borderColor: "#FF0000",
  },
  label: {
    position: "absolute",
    left: 8,
    zIndex: 10,
  },
  priceDollarSign: {
    position: "absolute",
    left: 12,
    fontSize: 20,
    color: "black",
    zIndex: 5,
  },
  errorText: {
    color: "#FF0000",
    marginTop: 5,
    fontSize: 14,
  },
});
