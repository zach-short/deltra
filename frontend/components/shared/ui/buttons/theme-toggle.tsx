import { Icon } from '@/components/shared/icons';
import { useTheme } from '@/context';
import { Pressable } from './pressable';
import { Text } from '../typography';
import { PhoneIcon } from '@/icons';

export function ThemeToggle() {
  const { themeMode, colorScheme, toggleTheme } = useTheme();
  console.log(
    themeMode,
    colorScheme,
    'themeMode, colorScheme in /ezhomesteading/components/shared/ui/buttons/theme-toggle.tsx',
  );

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Icon icon={PhoneIcon} size={24} />;
      case 'dark':
        return <Icon icon={PhoneIcon} size={24} />;
      case 'system':
        return <Icon icon={PhoneIcon} size={24} />;
    }
  };

  const getLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return `System (${colorScheme})`;
    }
  };

  return (
    <Pressable
      onPress={toggleTheme}
      className='flex-row items-center p-3 rounded-lg'
      lightColor='#f3f4f6'
      darkColor='#374151'
      wrapInText={false}
    >
      {getIcon()}
      <Text className='ml-2'>{getLabel()}</Text>
      {getLabel() === 'Dark' && <Text className='ml-2 '>(BETA)</Text>}
    </Pressable>
  );
}
