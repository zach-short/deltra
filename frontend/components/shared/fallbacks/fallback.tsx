import { SafeAreaView } from "@/components";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { Pressable, Text, View } from "../ui";

const COMMON_ERRORS = [404, 0];

export function Fallback({
  error,
  title,
  message,
  onRetry,
  onGoBack,
  type = "location",
  ...props
}: {
  error?: any;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  goBackHref?: string;
  type?: "location" | "listing" | "store" | "market";
}) {
  const isOffline = error?.status === 0;
  const isCommonError = error?.status in COMMON_ERRORS;

  const getImageSource = () => {
    if (isOffline) {
      /* return require("@/assets/images/not-found/offline.png");  */
      return "";
    }

    switch (type) {
      case "listing":
        return require("@/assets/images/not-found/no-listings.png");
      default:
        return require("@/assets/images/not-found/no-listings.png");
    }
  };

  const logo = getImageSource();

  const getDefaultTitle = () => {
    if (isOffline) {
      return "You're offline";
    }
    if (error?.status === 404) {
      return "Sorry, we couldn't find this item";
    }
    return "Something went wrong";
  };

  const getDefaultMessage = () => {
    if (isOffline) {
      return "Please check your internet connection and try again.";
    }
    if (error?.status === 404) {
      return "Please try refreshing if you're sure this exists.";
    }
    return "An error occurred while loading the content.";
  };

  const displayTitle = isCommonError ? getDefaultTitle() : title;
  const displayMessage = isCommonError ? getDefaultMessage() : message;

  return (
    <SafeAreaView className={`flex-1 w-full bg-white`}>
      <View className={`p-8`}>
        <Text font="outfitBold" className={`text-4xl`}>
          {displayTitle}
        </Text>
        <Text className={`text-sm`} font="outfitLight">
          {displayMessage}
        </Text>

        {isOffline ? (
          <OfflineContent onRetry={onRetry} onGoBack={onGoBack} />
        ) : (
          <OnlineErrorContent
            error={error}
            onRetry={onRetry}
            onGoBack={onGoBack}
          />
        )}

        <View style={[styles.imageContainer, styles.centeredImage]}>
          <Image source={logo} contentFit="contain" style={styles.image} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function OfflineContent({
  onRetry,
  onGoBack,
}: {
  onRetry?: () => void;
  onGoBack?: () => void;
}) {
  return (
    <>
      <View className={`mt-4 p-4 bg-gray-100 rounded-lg`}>
        <Text className={`text-sm text-gray-600`} font="outfitMedium">
          Offline Tips:
        </Text>
        <Text className={`text-xs mt-1 text-gray-500`} font="outfitLight">
          • Check your Wi-Fi or cellular connection
        </Text>
        <Text className={`text-xs text-gray-500`} font="outfitLight">
          • Move to an area with better signal
        </Text>
        <Text className={`text-xs text-gray-500`} font="outfitLight">
          • Try turning airplane mode on and off
        </Text>
      </View>

      <View className={`flex-row mt-6 mb-8`}>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            textProps={{
              font: "outfitMedium",
              className: `underline text-base mr-4 text-blue-600`,
            }}
          >
            Check Connection
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            if (onGoBack) onGoBack();
            else router.back();
          }}
          textProps={{
            font: "outfitLight",
            className: "underline text-base text-gray-600",
          }}
        >
          Go Back
        </Pressable>
      </View>
    </>
  );
}

function OnlineErrorContent({
  error,
  onRetry,
  onGoBack,
}: {
  error?: any;
  onRetry?: () => void;
  onGoBack?: () => void;
}) {
  return (
    <>
      {error?.message && (
        <Text className={`text-sm mt-2 text-red-500`} font="outfitLight">
          Error details: {error.message}
        </Text>
      )}

      <View className={`flex-row mt-4 mb-8`}>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            textProps={{
              font: "outfitMedium",
              className: `underline text-base mr-4`,
            }}
          >
            Try Again
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            if (onGoBack) onGoBack();
            else router.back();
          }}
          textProps={{
            font: "outfitLight",
            className: "underline text-base",
          }}
        >
          Go Back
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: 300,
  },
  centeredImage: {
    alignItems: "center",
  },
  image: {
    height: 200,
    width: 300,
    borderRadius: 8,
  },
});
