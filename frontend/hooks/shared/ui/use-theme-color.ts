import { Colors } from '@/constants/colors';
import { useTheme } from '@/context';

export function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
  props?: { light?: string; dark?: string },
) {
  const { colorScheme } = useTheme();
  const colorFromProps = props?.[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[colorScheme][colorName];
  }
}
