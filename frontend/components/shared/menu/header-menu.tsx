import { Avatar, PageTitle, Pressable, Text, View } from '@/components';
import { User } from '@/models/User';
import { Href, router } from 'expo-router';

interface MenuHeaderProps {
  title: string;
  user: User | null;
  viewButtonText: string;
  viewButtonRoute: Href;
}

export function MenuHeader({
  title,
  user,
  viewButtonText,
  viewButtonRoute,
}: MenuHeaderProps) {
  return (
    <View>
      <PageTitle title={title} />

      <View className='flex flex-row items-center justify-between'>
        <View className='flex flex-row items-center gap-x-2'>
          <Avatar size='large' image={user?.image} />
          <Text className='text-xl'>{user?.name}</Text>
        </View>

        <Pressable
          onPress={() => router.push(viewButtonRoute)}
          className='border p-3 rounded-full'
        >
          <Text className='text-xs underline'>{viewButtonText}</Text>
        </Pressable>
      </View>
    </View>
  );
}
