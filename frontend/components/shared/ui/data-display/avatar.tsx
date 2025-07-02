import { Image, ImageProps } from "expo-image";
import { ViewProps } from "react-native";
import { View } from "../layout";

interface AvatarProps {
  image?: string;
  size?: "small" | "medium" | "large";
  customSize?: number;
  imageProps?: ImageProps;
  viewProps?: ViewProps;
}

export const Avatar = ({
  image,
  size = "medium",
  customSize,
  imageProps,
  viewProps,
}: AvatarProps) => {
  const fallbackImage = require("@/assets/images/placeholder.jpg");

  let dimensions;
  if (customSize) {
    dimensions = { height: customSize, width: customSize };
  } else {
    switch (size) {
      case "small":
        dimensions = { height: 36, width: 36 };
        break;
      case "large":
        dimensions = { height: 60, width: 60 };
        break;
      case "medium":
      default:
        dimensions = { height: 48, width: 48 };
        break;
    }
  }

  const imageSource = image ? { uri: image } : fallbackImage;

  return (
    <View
      style={{
        ...dimensions,
        borderRadius: dimensions.height / 2,
        overflow: "hidden",
        position: "relative",
      }}
      {...viewProps}
    >
      <Image
        source={imageSource}
        style={{
          height: "100%",
          width: "100%",
          resizeMode: "cover",
        }}
        accessibilityLabel="Avatar"
        {...imageProps}
      />
    </View>
  );
};
