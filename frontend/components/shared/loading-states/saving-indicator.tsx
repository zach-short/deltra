import { View } from "@/components";
import { useEffect, useState } from "react";
import LoadingDots from "./loading-dots";

interface SavingIndicatorProps {
  isVisible: boolean;
  message?: string;
}

export function SavingIndicator({ isVisible }: SavingIndicatorProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <View className="absolute top-20 right-6">
      {isVisible && <LoadingDots />}
    </View>
  );
}
