import { Pressable, Text, View, Icon } from "@/components";
import { SmartFarmingIcon } from "@/icons";
import { router } from "expo-router";

interface SellProduceCardProps {
  show?: boolean;
}

export function SellProduceCard({ show = true }: SellProduceCardProps) {
  if (!show) return null;

  return (
    <Pressable
      className="h-fit w-full border rounded-md mb-3 mt-8 p-6 flex flex-row items-center justify-between"
      onPress={() => router.push("/new-listing")}
    >
      <View className="flex flex-col">
        <Text className="text-2xl">Sell your excess produce</Text>
        <Text className="text-gray-400 text-sm">
          Start listing any excess produce you grow with ease
        </Text>
      </View>
      <Icon icon={SmartFarmingIcon} height={48} width={48} />
    </Pressable>
  );
}
