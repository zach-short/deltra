import { Text } from "@/components/shared/ui/typography/text";
import {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import {
  StyleSheet,
  View,
  Animated,
  Pressable,
  PanResponder,
} from "react-native";

interface ToastProps {
  message?: string;
  description?: string;
  children?: ReactNode;
  duration?: number;
  onPress?: () => void;
  custom?: boolean;
}

interface ToastContextType {
  Toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType>({
  Toast: () => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState({
    message: "",
    description: "",
    children: null as ReactNode,
    custom: false,
    visible: false,
    onPress: undefined as (() => void) | undefined,
    duration: 3000,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearToastTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startToastTimer = () => {
    clearToastTimer();
    if (toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        hideToast();
      }, toast.duration);
    }
  };

  const hideToast = () => {
    clearToastTimer();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 40,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      panY.setValue(0);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        clearToastTimer();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          Animated.timing(panY, {
            toValue: 200,
            duration: 200,
            useNativeDriver: true,
          }).start(hideToast);
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();

          startToastTimer();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (toast.visible) {
      panY.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      startToastTimer();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(40);
    }

    return () => clearToastTimer();
  }, [toast.visible]);

  const showToast = (props: ToastProps) => {
    clearToastTimer();
    setToast({
      message: props.message || "",
      description: props.description || "",
      children: props.children || null,
      custom: props.custom || false,
      visible: true,
      onPress: props.onPress,
      duration: props.duration || 3000,
    });
  };

  const handlePress = () => {
    if (toast.onPress) {
      toast.onPress();
      hideToast();
    }
  };

  return (
    <ToastContext.Provider value={{ Toast: showToast }}>
      {children}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { translateY: panY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Pressable
            onPress={handlePress}
            onPressIn={() => clearToastTimer()}
            onPressOut={() => startToastTimer()}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={styles.toast}>
              {toast.custom ? (
                toast.children
              ) : (
                <View style={styles.contentContainer}>
                  {toast.message ? (
                    <Text style={styles.message}>{toast.message}</Text>
                  ) : null}
                  {toast.description ? (
                    <Text style={styles.description}>{toast.description}</Text>
                  ) : null}
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const useToastContext = () => useContext(ToastContext);

export const Toast = (props: ToastProps) => {
  const { Toast: showToast } = useToastContext();
  showToast(props);
};

export const useToast = () => useToastContext();

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: 350,
    maxWidth: 600,
    backgroundColor: "white",
    padding: 16,
  },
  contentContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 4,
  },
});
