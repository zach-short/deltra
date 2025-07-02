import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Pressable, PressableProps } from 'react-native';
import { BottomSheetViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types';
import { BottomSheetModalProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetModal/types';
import { useRef, useCallback } from 'react';

export function BottomSheet({
  buttonProps,
  modalProps,
  viewProps,
  onPress,
  dimBackground = true,
  showHandle = false,
}: {
  modalProps?: Partial<BottomSheetModalProps>;
  viewProps?: BottomSheetViewProps;
  buttonProps?: PressableProps;
  onPress?: () => void;
  dimBackground?: boolean;
  showHandle?: boolean;
}) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <>
      <Pressable
        onPress={() => {
          if (onPress) {
            setTimeout(() => {
              onPress();
            }, 200);
          }
          bottomSheetModalRef.current?.present();
        }}
        {...buttonProps}
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        className={`border-t border-x border-neutral-400 rounded-t-2xl`}
        handleIndicatorStyle={{ display: 'none' }}
        handleStyle={{ display: 'none' }}
        backdropComponent={dimBackground ? renderBackdrop : undefined}
        handleComponent={showHandle ? undefined : null}
        {...modalProps}
      >
        <BottomSheetView {...viewProps} />
      </BottomSheetModal>
    </>
  );
}
