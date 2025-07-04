import { ReactNode } from 'react';
import { Platform } from 'react-native';
import { WebBottomSheet } from './web-bottom-sheet';
import { NativeBottomSheet } from './native-bottom-sheet';
import { useDeviceInfo } from '@/hooks/use-device-info';

export interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
  enableContentPanningGesture?: boolean;
}

export function BottomSheet(props: BottomSheetProps) {
  const { isDesktop } = useDeviceInfo();

  if (Platform.OS === 'web' && isDesktop) {
    return <WebBottomSheet {...props} />;
  }

  return <NativeBottomSheet {...props} />;
}

export { BottomSheetProps };

