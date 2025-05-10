import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 필요한 폰트 추가
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    GmarketSansBold: require('../assets/fonts/GmarketSansTTFBold.ttf'), // 추가된 폰트
    GmarketSansLight: require('../assets/fonts/GmarketSansTTFLight.ttf'), // 추가된 폰트
    GmarketSansMedium: require('../assets/fonts/GmarketSansTTFMedium.ttf'), // 추가된 폰트
  });

  if (!loaded) {
    // 폰트가 로드될 때까지 빈 화면 표시
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
