import { Pressable, View } from "@/components";
import { Icon } from "@/components/shared/icons";
import { Text } from "@/components/shared/ui/typography/text";
import { RightArrowCircleIcon } from "@/icons";
import { Href, router } from "expo-router";
import { ReactNode } from "react";

interface p {
  title?: string;
  href: Href;
  icon: ReactNode;
  name: string;
  onPress?: () => void;
}

export const MenuCard = ({ title = "", onPress, href, icon, name }: p) => {
  return (
    <View className={`w-full`}>
      {title && (
        <Text
          className="text-2xl mt-6 border-b"
          style={{ borderColor: "#E4E4E7" }}
        >
          {title}
        </Text>
      )}

      <Pressable
        onPress={() => {
          if (onPress) {
            onPress();
          }
          router.push(href);
        }}
      >
        <View
          className={`h-12 flex items-center justify-between flex-row w-full ${
            title && "mt-4"
          }`}
        >
          <View className={`flex flex-row items-center`}>
            {icon}
            <Text font="outfitRegular" className={`pl-4 text-base`}>
              {name}
            </Text>
          </View>
          <Icon icon={RightArrowCircleIcon} height={28} width={28} />
        </View>
      </Pressable>
    </View>
  );
};
