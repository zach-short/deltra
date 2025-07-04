import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './global.css';

import { useEffect } from 'react';
import {
  AuthProvider,
  ToastProvider,
  ThemeProvider,
  CoveredCallProvider,
  PortfolioProvider,
  StockProvider,
} from '@/context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { fontMap } from '@/components';

let BottomSheetModalProvider: any = null;
try {
  const gorhomBottomSheet = require('@gorhom/bottom-sheet');
  BottomSheetModalProvider = gorhomBottomSheet.BottomSheetModalProvider;
} catch (error) {
  BottomSheetModalProvider = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
}

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
      <AuthProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <BottomSheetModalProvider>
              <PortfolioProvider>
                <CoveredCallProvider>
                  <StockProvider>
                    <ToastProvider>
                      <Stack>
                        <Stack.Screen
                          name='index'
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name='s/[id]'
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen name='+not-found' />
                      </Stack>
                      <StatusBar style='auto' />
                    </ToastProvider>
                  </StockProvider>
                </CoveredCallProvider>
              </PortfolioProvider>
            </BottomSheetModalProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}
