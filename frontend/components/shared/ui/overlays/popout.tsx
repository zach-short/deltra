import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Modal,
  Dimensions,
  LayoutChangeEvent,
  PressableProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import { View, Pressable } from "@/components";

interface PopoutProps extends PressableProps {
  children: React.ReactNode;
  popoutContent: React.ReactNode;
  popoutStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  spacing?: number;
  preferTop?: boolean;
  preferLeft?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  onOpen?: () => void;
  onClose?: () => void;
  visible?: boolean;
  onToggle?: () => void;
}

export function Popout({
  children,
  popoutContent,
  popoutStyle,
  buttonStyle,
  spacing = 5,
  preferTop = false,
  preferLeft = false,
  maxWidth = 300,
  maxHeight = 400,
  onOpen,
  onClose,
  visible,
  onToggle,
  ...pressableProps
}: PopoutProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const isVisible = visible !== undefined ? visible : internalVisible;
  const [popoutPosition, setPopoutPosition] = useState({ top: 0, left: 0 });
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [placement, setPlacement] = useState({
    top: false,
    left: false,
  });

  const triggerRef = useRef<View>(null);
  const windowDimensions = Dimensions.get("window");

  const togglePopout = () => {
    if (onToggle) {
      onToggle();
    } else {
      if (!isVisible) {
        measureTriggerPosition();
        onOpen?.();
      } else {
        onClose?.();
      }
      setInternalVisible(!isVisible);
    }
  };

  const closePopout = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalVisible(false);
    }
    onClose?.();
  };

  const measureTriggerPosition = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        calculatePopoutPosition({ x, y, width, height });
      });
    }
  };

  const calculatePopoutPosition = (triggerLayout: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    let top = triggerLayout.y + triggerLayout.height + spacing;
    let left = triggerLayout.x;

    const shouldPlaceOnTop =
      preferTop || top + contentSize.height > windowDimensions.height - 20;

    const shouldPlaceOnLeft =
      preferLeft || left + contentSize.width > windowDimensions.width - 20;

    if (shouldPlaceOnTop) {
      top = triggerLayout.y - contentSize.height - spacing;
    }

    if (shouldPlaceOnLeft) {
      left = triggerLayout.x + triggerLayout.width - contentSize.width;
    }

    left = Math.max(
      10,
      Math.min(left, windowDimensions.width - contentSize.width - 10),
    );
    top = Math.max(
      10,
      Math.min(top, windowDimensions.height - contentSize.height - 10),
    );

    setPopoutPosition({ top, left });
    setPlacement({ top: shouldPlaceOnTop, left: shouldPlaceOnLeft });
  };

  const onPopoutLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== contentSize.width || height !== contentSize.height) {
      setContentSize({ width, height });
      measureTriggerPosition();
    }
  };

  useEffect(() => {
    if (visible) {
      measureTriggerPosition();
    }
  }, [contentSize, windowDimensions]);

  return (
    <View>
      <Pressable
        onPress={togglePopout}
        style={[buttonStyle]}
        {...pressableProps}
      >
        {children}
      </Pressable>
      <Modal
        transparent
        visible={isVisible}
        animationType="fade"
        onRequestClose={closePopout}
      >
        <Pressable onPress={closePopout}>
          <View
            style={[
              styles.popoutContainer,
              {
                top: popoutPosition.top,
                left: popoutPosition.left,
                maxWidth,
                maxHeight,
              },
              popoutStyle,
            ]}
            onLayout={onPopoutLayout}
            pointerEvents="box-none"
          >
            {popoutContent}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  popoutContainer: {
    position: "absolute",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
});
