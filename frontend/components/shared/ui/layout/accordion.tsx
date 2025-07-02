import { StyleSheet } from "react-native";
import { View, Pressable } from "@/components/shared";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ReactNode, useCallback } from "react";
import { StyleProp, ViewStyle, PressableProps, ViewProps } from "react-native";
import { SharedValue } from "react-native-reanimated";

const AccordionItem: React.FC<AccordionItemProps> = ({
  isExpanded,
  children,
  viewKey,
  style,
  duration = 300,
  contentProps = {},
}) => {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * Number(isExpanded.value), { duration }),
  );

  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
  }));

  return (
    <Animated.View
      key={`accordionItem_${viewKey}`}
      style={[styles.animatedView, bodyStyle, style]}
    >
      <View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={styles.wrapper}
        {...contentProps}
      >
        {children}
      </View>
    </Animated.View>
  );
};

export function Accordion({
  headerContent,
  children,
  containerStyle,
  headerStyle,
  contentStyle,
  animationDuration = 300,
  initialExpanded = false,
  onToggle,
  buttonProps = {},
  contentProps = {},
  index,
}: AccordionProps) {
  const isExpanded = useSharedValue(initialExpanded);

  const toggleAccordion = useCallback(() => {
    isExpanded.value = !isExpanded.value;
    if (onToggle) {
      onToggle(isExpanded.value);
    }
  }, [isExpanded, onToggle]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        onPress={toggleAccordion}
        style={[styles.header, headerStyle]}
        wrapInText={false}
        {...buttonProps}
      >
        {typeof headerContent === "function"
          ? headerContent(isExpanded.value)
          : headerContent}
      </Pressable>

      <AccordionItem
        isExpanded={isExpanded}
        viewKey={`accordion_content_${index}`}
        style={contentStyle}
        duration={animationDuration}
        contentProps={contentProps}
      >
        {children}
      </AccordionItem>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  wrapper: {
    width: "100%",
    position: "absolute",
  },
  animatedView: {
    width: "100%",
    overflow: "hidden",
  },
});

interface AccordionItemProps {
  isExpanded: SharedValue<boolean>;
  children: ReactNode;
  viewKey: string;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  contentProps?: ViewProps;
}

interface AccordionProps {
  /**
   * Content for the accordion header/button area.
   * Can be a React node or a function that receives the current expanded state
   */
  headerContent: ReactNode | ((isExpanded: boolean) => ReactNode);

  index?: number;
  /**
   * Content for the expandable section
   */
  children: ReactNode;

  /**
   * Custom styling for the main container
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom styling for the header/button
   */
  headerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom styling for the content container
   */
  contentStyle?: StyleProp<ViewStyle>;

  /**
   * Duration of the expand/collapse animation in milliseconds
   * @default 300
   */
  animationDuration?: number;

  /**
   * Whether the accordion starts in expanded state
   * @default false
   */
  initialExpanded?: boolean;

  /**
   * Callback function when accordion is toggled
   * @param expanded The new expanded state
   */
  onToggle?: (expanded: boolean) => void;

  /**
   * Additional props to pass to the Pressable button component
   */
  buttonProps?: Omit<PressableProps, "onPress" | "style">;

  /**
   * Additional props to pass to the content wrapper View
   */
  contentProps?: ViewProps;
}
