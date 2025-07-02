import { SafeAreaView } from "@/components";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { Pressable, Text, View } from "../ui";

export function SetupPrompt({
  title,
  subtitle,
  buttonTitle,
  type,
}: {
  title: string;
  subtitle: string;
  buttonTitle: string;
  type: "listing" | "calendar" | "store";
}) {
  const getImageSource = () => {
    switch (type) {
      case "listing":
        return require("@/assets/images/setup-prompts/new-listing.jpg");
      case "store":
        return require("@/assets/images/setup-prompts/new-store.jpg");
      default:
        return require("@/assets/images/setup-prompts/new-listing.jpg");
    }
  };

  const img = getImageSource();

  return (
    <SafeAreaView className={`flex-1 px-8 w-full bg-white`}>
      <Text font="outfitBold" className={`text-4xl`}>
        {title}
      </Text>
      <Text className={`text-sm`} font="outfitLight">
        {subtitle}
      </Text>
      <View style={styles.imageContainer} className={`my-8`}>
        <Image source={img} contentFit="contain" style={styles.image} />
      </View>
      <Pressable
        onPress={() => {
          router.back();
        }}
        className={`bg-emerald-900 rounded-md p-5 w-full`}
        textProps={{
          className: "text-white text-center text-xl",
          font: "outfitBold",
        }}
      >
        {buttonTitle}
      </Pressable>
      <Pressable
        onPress={() => {
          router.back();
        }}
        textProps={{
          font: "outfitLight",
          className: "underline text-sm mt-1 mt-4 text-center",
        }}
      >
        Maybe Later
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: 200,
  },
  image: {
    height: 200,
    borderRadius: 8,
  },
});

export function NoSellerStore() {
  return (
    <SetupPrompt
      title="Create Your First Store"
      subtitle="Turn your passion or hobby into profit by selling your homegrown produce. Set your own hours, manage pickup or delivery options, and connect with local customers who value fresh, sustainable food."
      buttonTitle="Open My First Store"
      type="store"
    />
  );
}

export function NoSellerListings() {
  return (
    <SetupPrompt
      title="Sell Your Excess Produce"
      subtitle="Your garden or farm is thriving! List your seasonal produce, set your own prices, and help your community access fresh, local food. Creating listings takes just minutes and puts you in complete control."
      buttonTitle="List My Produce"
      type="listing"
    />
  );
}
