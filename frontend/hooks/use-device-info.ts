import { useState, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';

interface DeviceInfo {
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    const { width, height } = Dimensions.get('window');
    return {
      isDesktop: Platform.OS === 'web' && width >= 1024,
      isMobile: Platform.OS !== 'web' || width < 768,
      isTablet: Platform.OS !== 'web' && width >= 768 && width < 1024,
      screenWidth: width,
      screenHeight: height,
    };
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateDeviceInfo = () => {
        const { width, height } = Dimensions.get('window');
        setDeviceInfo({
          isDesktop: width >= 1024,
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          screenWidth: width,
          screenHeight: height,
        });
      };

      const subscription = Dimensions.addEventListener('change', updateDeviceInfo);
      return () => subscription?.remove();
    }
  }, []);

  return deviceInfo;
}