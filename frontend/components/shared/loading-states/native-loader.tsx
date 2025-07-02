import { SafeAreaView } from "@/components";
import { ActivityIndicator } from "react-native";

export function Loader() {
  return (
    <SafeAreaView
      className={`flex-1 bg-white w-full justify-center items-center`}
    >
      <ActivityIndicator color={"#ced9bb"} size={"large"} />
    </SafeAreaView>
  );
}
