import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ReactNode } from 'react';
import {
  AuthProvider,
  ToastProvider,
  ThemeProvider,
  CoveredCallProvider,
  PortfolioProvider,
  StockProvider,
} from '@/context';

let BottomSheetModalProvider: any = null;
try {
  const gorhomBottomSheet = require('@gorhom/bottom-sheet');
  BottomSheetModalProvider = gorhomBottomSheet.BottomSheetModalProvider;
} catch (error) {
  BottomSheetModalProvider = ({ children }: { children: ReactNode }) => (
    <>{children}</>
  );
}

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <PortfolioProvider>
              <CoveredCallProvider>
                <StockProvider>
                  <ToastProvider>{children}</ToastProvider>
                </StockProvider>
              </CoveredCallProvider>
            </PortfolioProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

