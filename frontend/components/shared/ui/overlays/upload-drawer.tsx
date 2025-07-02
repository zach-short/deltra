import { ReactNode, useRef, useContext, createContext, useState } from "react";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ActivityIndicator, Alert } from "react-native";
import { Text, View, Pressable } from "@/components/shared";
import { useImageUploader } from "@/hooks";
import { NewListingFormData } from "@/utils";

const DrawerContext = createContext({
  isAnyDrawerOpen: false,
  setIsAnyDrawerOpen: (isOpen: boolean) => { },
});

function UploadDrawer({
  itemWidth = 40,
  button,
  updateFormData,
  formData,
  buttonClassName,
}: {
  itemWidth?: number;
  updateFormData: any;
  formData: NewListingFormData;
  buttonClassName?: string;
  button?: ReactNode;
}) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { isAnyDrawerOpen, setIsAnyDrawerOpen } = useContext(DrawerContext);

  const MAX_IMAGES = 3;
  const createImageUploader = useImageUploader();

  const { isUploading, handleOpenLibrary, handleOpenCamera } =
    createImageUploader("listingImages", {
      onUploadBegin: (e) => {
        bottomSheetModalRef.current?.dismiss();
        setIsAnyDrawerOpen(false);
        return true;
      },
      onUploadError: (e) => {
        Alert.alert("Upload Error", e.data?.reason ?? e.message);
      },
      onUploadProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      },
      onClientUploadComplete: (files) => {
        // Check if adding the new files would exceed the maximum
        const currentCount = formData.images.length;
        const newFilesCount = files.length;

        if (currentCount + newFilesCount > MAX_IMAGES) {
          // Calculate how many we can actually add
          const canAdd = MAX_IMAGES - currentCount;

          if (canAdd <= 0) {
            Alert.alert(
              "Maximum Images",
              `You can only upload a maximum of ${MAX_IMAGES} images.`,
            );
            return;
          }

          // Only add the first 'canAdd' files
          const filesToAdd = files.slice(0, canAdd);
          const newImages = [...formData.images];

          for (let i = 0; i < filesToAdd.length; i++) {
            newImages.push(filesToAdd[i].ufsUrl);
          }

          updateFormData("images", newImages);

          Alert.alert(
            "Maximum Images",
            `Only added ${canAdd} ${canAdd === 1 ? "image" : "images"
            } to reach the limit of ${MAX_IMAGES}.`,
          );
        } else {
          // Add all files since we're under the limit
          if (files.length === 1) {
            updateFormData("images", [...formData.images, files[0].ufsUrl]);
          } else if (files.length > 1) {
            const newImages = [...formData.images];
            for (let i = 0; i < files.length; i++) {
              newImages.push(files[i].ufsUrl);
            }
            updateFormData("images", newImages);
          }
        }

        bottomSheetModalRef.current?.dismiss();
        setIsAnyDrawerOpen(false);
      },
    });

  const handleOpenDrawer = () => {
    if (!isAnyDrawerOpen) {
      const remainingSlots = MAX_IMAGES - formData.images.length;

      if (remainingSlots <= 0) {
        Alert.alert(
          "Maximum Images",
          `You've already added the maximum number of ${MAX_IMAGES} images.`,
        );
        return;
      }

      setIsAnyDrawerOpen(true);
      bottomSheetModalRef.current?.present();
    } else {
      Alert.alert("Please complete the current selection first");
    }
  };

  return (
    <Pressable
      onPress={handleOpenDrawer}
      className={`bg-white flex items-center justify-center border ${buttonClassName}`}
      style={{
        width: itemWidth,
        height: itemWidth,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#e4e4e7",
      }}
      wrapInText={false}
      disabled={isAnyDrawerOpen && !isUploading}
    >
      {isUploading ? (
        <ActivityIndicator color="#cde9bb" />
      ) : (
        <View>{button}</View>
      )}

      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        onDismiss={() => setIsAnyDrawerOpen(false)}
        handleStyle={{ backgroundColor: "white" }}
      >
        <BottomSheetView className="rounded-xl border flex items-center h-fit">
          <>
            <Pressable
              onPress={handleOpenLibrary}
              className="flex w-full flex-row items-center p-4"
              wrapInText={false}
            >
              <Text className="text-2xl">Select Image</Text>
              {formData.images.length > 0 && (
                <Text className="text-sm ml-2">
                  ({formData.images.length}/{MAX_IMAGES})
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={handleOpenCamera}
              className="flex w-full flex-row items-center p-4"
              wrapInText={false}
            >
              <Text className="text-2xl">Take Photo</Text>
            </Pressable>
            <View className="h-28" />
          </>
        </BottomSheetView>
      </BottomSheetModal>
    </Pressable>
  );
}

export function UploadActionDrawer(props) {
  return (
    <BottomSheetModalProvider>
      <UploadDrawer {...props} />
    </BottomSheetModalProvider>
  );
}

export function DrawerProvider({ children }) {
  const [isAnyDrawerOpen, setIsAnyDrawerOpen] = useState(false);

  return (
    <DrawerContext.Provider value={{ isAnyDrawerOpen, setIsAnyDrawerOpen }}>
      {children}
    </DrawerContext.Provider>
  );
}
