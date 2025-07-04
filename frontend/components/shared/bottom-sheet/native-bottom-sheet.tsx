import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomSheetProps } from './bottom-sheet';
import { fonts } from '@/components/shared/ui/typography/fonts';

let BottomSheetModal: any = null;
let BottomSheetView: any = null;

try {
  const gorhomBottomSheet = require('@gorhom/bottom-sheet');
  BottomSheetModal = gorhomBottomSheet.BottomSheetModal;
  BottomSheetView = gorhomBottomSheet.BottomSheetView;
} catch (error) {
  console.warn(
    'Gorhom bottom sheet library not found, falling back to simple modal',
  );
}

export function NativeBottomSheet({
  isVisible,
  onClose,
  children,
  title,
  snapPoints = ['50%', '90%'],
  enablePanDownToClose = true,
  enableContentPanningGesture = true,
}: BottomSheetProps) {
  const bottomSheetModalRef = React.useRef<any>(null);

  const snapPointsMemo = useMemo(() => snapPoints, [snapPoints]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  if (!BottomSheetModal) {
    return (
      <FallbackBottomSheet
        isVisible={isVisible}
        onClose={onClose}
        title={title}
      >
        {children}
      </FallbackBottomSheet>
    );
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPointsMemo}
      onChange={handleSheetChanges}
      enablePanDownToClose={enablePanDownToClose}
      enableContentPanningGesture={enableContentPanningGesture}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}

        <View style={styles.content}>{children}</View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function FallbackBottomSheet({
  isVisible,
  onClose,
  children,
  title,
}: {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  if (!isVisible) return null;

  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.fallbackBackdrop} />
      <View style={styles.fallbackSheet}>
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#1C1C1E',
  },
  handleIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interBold,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  fallbackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  fallbackBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fallbackSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '90%',
  },
});

