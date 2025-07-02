import {
  ElementRefs,
  FocusScrollContext,
  useFocusScrollContext,
} from "@/context";
import React, { ReactNode, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ViewProps,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { View } from "../ui";

export interface KeyboardDismissViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  keyboardOffset?: number;
}

export interface KeyboardScrollProps
  extends Omit<ScrollToFocusedProps, "keyboardOffset"> {
  children: ReactNode;
  scrollPadding?: number;
  keyboardOffset?: number;
}

export interface ScrollToFocusedProps extends Omit<ScrollViewProps, "ref"> {
  children: ReactNode;
  scrollPadding?: number;
}

export interface FocusableViewProps extends Omit<ViewProps, "ref"> {
  focusKey: string;
  children: ReactNode;
}

export function KeyboardDismissView({
  children,
  style,
  scrollable = false,
  keyboardOffset = 100,
}: KeyboardDismissViewProps) {
  const ContentContainer = scrollable ? ScrollView : View;

  const scrollViewProps = scrollable
    ? {
      keyboardShouldPersistTaps: "handled" as const,
      keyboardDismissMode: "on-drag" as const,
    }
    : {};

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      keyboardVerticalOffset={keyboardOffset}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ContentContainer style={styles.content} {...scrollViewProps}>
        {children}
      </ContentContainer>
    </KeyboardAvoidingView>
  );
}

export function KeyboardAwareContainer({
  children,
  scrollPadding = 0,
  keyboardOffset = 0,
  ...props
}: KeyboardScrollProps) {
  const Content = Platform.OS === "web" ? View : KeyboardDismissView;
  return (
    <Content keyboardOffset={keyboardOffset}>
      <ScrollToFocused scrollPadding={scrollPadding} {...props}>
        {children}
      </ScrollToFocused>
    </Content>
  );
}

export function ScrollToFocused({
  children,
  scrollPadding = 0,
  ...props
}: ScrollToFocusedProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const elementRefs = useRef<ElementRefs>({});

  const scrollToElement = (key: string) => {
    setTimeout(() => {
      if (scrollViewRef.current && elementRefs.current[key]) {
        elementRefs.current[key]?.measureLayout(
          scrollViewRef.current as any,
          (x: number, y: number, width: number, height: number) => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - scrollPadding),
              animated: true,
            });
          },
          () => console.log(`Failed to measure element with key: ${key}`),
        );
      }
    }, 100);
  };

  const registerRef = (key: string, ref: View | null) => {
    elementRefs.current[key] = ref;
  };

  return (
    <FocusScrollContext.Provider
      value={{ registerRef, scrollToKey: scrollToElement }}
    >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          {...props}
        >
          {children}
          <View className="h-[30vh]" />
        </ScrollView>
      </SafeAreaView>
    </FocusScrollContext.Provider>
  );
}

export function FocusableView({
  focusKey,
  children,
  ...props
}: FocusableViewProps) {
  const { registerRef, scrollToKey } = useFocusScrollContext();
  const viewRef = useRef<View>(null);

  useEffect(() => {
    if (viewRef.current) {
      registerRef(focusKey, viewRef.current);
    }
  }, [focusKey, registerRef]);

  return (
    <View ref={viewRef} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as any;

          if (childProps.onFocus && typeof childProps.onFocus === "function") {
            return React.cloneElement(
              child as React.ReactElement<any>,
              {
                onFocus: () => {
                  scrollToKey(focusKey);
                  childProps.onFocus();
                },
              } as any,
            );
          }
        }
        return child;
      })}
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
