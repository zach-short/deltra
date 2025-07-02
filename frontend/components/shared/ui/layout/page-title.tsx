import { BackArrow, Text, View } from '@/components';
import { ViewProps } from 'react-native';

interface PageTitleProps extends ViewProps {
  title: string;
  showBackArrow?: boolean;
  textProps?: Omit<React.ComponentProps<typeof Text>, 'children'>;
  iconProps?: React.ComponentProps<typeof BackArrow>;
}

export const PageTitle = ({
  title,
  showBackArrow = false,
  textProps,
  iconProps,
  ...viewProps
}: PageTitleProps) => {
  return (
    <View {...viewProps}>
      {showBackArrow && <BackArrow {...iconProps} />}
      <Text
        className={`text-4xl ${showBackArrow ? 'pb-8 pt-2' : 'py-8'}`}
        {...textProps}
      >
        {title}
      </Text>
    </View>
  );
};
