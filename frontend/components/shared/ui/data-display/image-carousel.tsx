import { Pressable, View } from "@/components";
import { Icon } from "@/components/shared/icons";
import { LeftArrowIcon, RightArrowIcon } from "@/icons";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import {
  Dimensions,
  ImageStyle,
  Platform,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

interface ImageCarouselProps {
  images: string[];
  containerStyle?: ViewStyle;
  imageContainerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
}

interface RenderItemProps {
  item: string;
  index: number;
}

export const ImageCarousel = ({
  images = [],
  containerStyle = {},
  imageContainerStyle = {},
  imageStyle = {},
}: ImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollOffsetValue = useSharedValue(0);
  const carouselRef = useRef<ICarouselInstance>(null);

  const goToNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const goToPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    }
  };

  const goToIndex = (index: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ index, animated: true });
    }
  };

  const renderItem = ({ item }: RenderItemProps) => {
    return (
      <View style={[styles.imageContainer, imageContainerStyle]}>
        <Image source={{ uri: item }} style={[styles.image, imageStyle]} />
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Carousel
        ref={carouselRef}
        loop={true}
        width={width}
        height={width}
        autoPlay={false}
        data={images}
        scrollAnimationDuration={500}
        defaultScrollOffsetValue={scrollOffsetValue}
        onSnapToItem={(index: number) => setActiveIndex(index)}
        renderItem={renderItem}
        onConfigurePanGesture={(g) => {
          "worklet";
          // VERY IMPORTANT
          // pan gesture only responds to horizontal movements
          // and allow vertical scrolling to pass through
          g.activeOffsetX([-10, 10]);
          g.failOffsetY([-5, 5]);
        }}
        style={styles.carousel}
      />
      <BottomNavDots
        images={images}
        goToIndex={goToIndex}
        activeIndex={activeIndex}
      />
      <WebArrows images={images} goToPrev={goToPrev} goToNext={goToNext} />
    </View>
  );
};

export const BottomNavDots = ({
  images,
  activeIndex,
  goToIndex,
}: {
  images: string[];
  activeIndex: number;
  goToIndex: (index: number) => void;
}) => {
  return (
    <>
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <Pressable
              hitSlop={1}
              key={index}
              style={[
                styles.paginationDot,
                activeIndex === index && styles.paginationDotActive,
              ]}
              onPress={(e) => {
                e.preventDefault();
                goToIndex(index);
              }}
              wrapInText={false}
            />
          ))}
        </View>
      )}
    </>
  );
};

export const WebArrows = ({
  images,
  goToPrev,
  goToNext,
}: {
  images: string[];
  goToPrev: () => void;
  goToNext: () => void;
}) => {
  return (
    <>
      {Platform.OS === "web" && (
        <>
          {images.length > 1 && (
            <Pressable
              style={styles.leftArrowContainer}
              onPress={goToPrev}
              hitSlop={20}
              wrapInText={false}
            >
              <Icon icon={LeftArrowIcon} width={24} height={24} />
            </Pressable>
          )}

          {images.length > 1 && (
            <Pressable
              style={styles.rightArrowContainer}
              onPress={goToNext}
              hitSlop={20}
              wrapInText={false}
            >
              <Icon icon={RightArrowIcon} width={24} height={24} />
            </Pressable>
          )}
        </>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: "100%",
    width: "100%",
  },
  carousel: {
    width: "100%",
  },
  imageContainer: {
    overflow: "hidden",
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  paginationDotActive: {
    backgroundColor: "white",
  },
  leftArrowContainer: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -15 }],
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 8,
  },
  rightArrowContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -15 }],
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 8,
  },
});
