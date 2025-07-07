import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './global.css';

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { fontMap } from '@/components';
import { AppProviders } from '@/components/shared/providers/providers';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontMap);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Deltra</title>
      </Head>
      <AppProviders>
        <Stack>
          <Stack.Screen name='index' options={{ headerShown: false }} />
          <Stack.Screen name='s/[id]' options={{ headerShown: false }} />
          <Stack.Screen name='+not-found' />
        </Stack>
        <StatusBar style='auto' />
      </AppProviders>
    </>
  );
}
