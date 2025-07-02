import { Platform } from "react-native";
import { LoadingDots, Pressable } from "@/components";
import { useUserMode, UserMode } from "@/context";

export function SwitchModeButton() {
  const { currentMode, switchMode, isLoading } = useUserMode();

  const isSeller = currentMode === UserMode.SELLER;

  const handlePress = () => {
    switchMode();
  };

  if (isLoading) {
    return <LoadingDots />;
  }

  return (
    <Pressable
      className={`absolute ${Platform.OS === "ios" ? "bottom-24" : "bottom-32"
        } w-48 rounded-full p-3 right-1/2 transform translate-x-1/2 ${isSeller ? "!bg-[#1d4ed8]" : "!bg-[#cde9bb]"}`}
      textProps={{
        className: `text-xl text-center ${!isSeller && "!text-black"}`,
      }}
      borderWidth={1}
      onPress={handlePress}
    >
      Switch to {isSeller ? "Buying" : "Selling"}
    </Pressable>
  );
}
