import { useEffect, useRef, useState } from "react";
import {
  TextInput,
  FlatList,
  Keyboard,
  Animated,
  TextStyle,
  TextInputProps,
  StyleSheet,
} from "react-native";
import { fonts, View, Pressable } from "@/components";
import Fuse from "fuse.js";

const UNIT_OPTIONS = [
  "each",
  "lb",
  "dozen",
  "bunch",
  "pint",
  "quart",
  "box",
  "basket",
  "bag",
  "jar",
  "bundle",
  "bottle",

  "head",
  "oz",
  "piece",
  "half-dozen",
  "pack",
  "gallon",
  "carton",
  "bulb",
  "liter",
  "kg",
  "crate",
  "cup",
  "set",
  "pair",

  "bushel",
  "g",
  "punnet",
  "flat",
  "peck",
  "tray",
  "pot",
  "ear",
  "loaf",
  "bouquet",
  "bar",
  "block",
  "can",
  "case",
  "half-pint",
  "sack",

  "stem",
  "stalk",
  "clove",
  "sprig",
  "slice",
  "ml",
  "roll",
  "sheet",
  "skein",
  "hank",
  "vial",
  "tin",
  "wreath",
  "bale",
  "sample",

  "plant",
  "branch",
  "wedge",
  "portion",
  "handful",
  "stick",
  "strand",
  "tub",
  "wheel",
  "rack",
  "scoop",
];
export const UnitSelector = ({
  selectedUnit,
  onTextChange,
  onFocusChange,
  style,
  dropDownClassName,
  ...props
}: {
  selectedUnit: string;
  onTextChange: (text: string) => void;
  onFocusChange?: (focus: boolean) => void;
  style?: any;
  dropDownClassName?: string;
  props?: TextInputProps;
}) => {
  const [isFocused, setIsFocused] = useState(!!selectedUnit);
  const labelAnimation = useRef(
    new Animated.Value(selectedUnit ? 1 : 0),
  ).current;

  useEffect(() => {
    if (selectedUnit) {
      setIsFocused(true);
      Animated.timing(labelAnimation, {
        toValue: 1,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, []);
  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!selectedUnit) {
      setIsFocused(false);
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

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

  const [query, setQuery] = useState(selectedUnit || "");
  const [showDropdown, setShowDropdown] = useState(false);

  const fuse = new Fuse(UNIT_OPTIONS, {
    keys: ["name"],
    threshold: 0.4,
    distance: 100,
  });

  const filteredUnits = query
    ? (query.length < 2
      ? UNIT_OPTIONS.filter((unit) =>
        unit.toLowerCase().includes(query.toLowerCase()),
      )
      : fuse.search(query).map((result) => result.item)
    ).slice(0, 5)
    : UNIT_OPTIONS.slice(0, 5);

  const handleSelectUnit = (unit) => {
    setQuery(unit);
    onTextChange(unit);
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  return (
    <View className="w-full relative">
      <View style={styles.container}>
        <Animated.Text
          style={[{ fontFamily: fonts.outfitThin }, styles.label, labelStyle]}
        >
          Units
        </Animated.Text>
        <Pressable onPress={() => setShowDropdown(true)}>
          <TextInput
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              onTextChange(text);
              setShowDropdown(true);
            }}
            onFocus={() => {
              handleFocus();
              setShowDropdown(true);
              if (onFocusChange) onFocusChange(true);
            }}
            onBlur={() => {
              handleBlur();
              setTimeout(() => {
                setShowDropdown(false);
                if (onFocusChange) onFocusChange(false);
              }, 150);
            }}
            style={[{ fontFamily: fonts.outfitMedium }, styles.input, style]}
            {...props}
          />
        </Pressable>
      </View>

      <View className={`bg-white w-full h-0 ${dropDownClassName}`}>
        {showDropdown && filteredUnits.length > 0 && (
          <FlatList
            data={filteredUnits}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectUnit(item)}
                className="py-2 px-3 border-gray-200 active:bg-gray-100"
                textProps={{ className: "text-lg" }}
              >
                {item}
              </Pressable>
            )}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    padding: 20,
    paddingLeft: 10,
    fontSize: 20,
    height: 64,
  },
  label: {
    position: "absolute",
    left: 8,
  },
});
