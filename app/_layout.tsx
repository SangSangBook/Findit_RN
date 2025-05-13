import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 추가
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 필요한 폰트 추가
  const [loaded] = useFonts({
    AppleSDGothicNeoM: require('../assets/fonts/AppleSDGothicNeoM.ttf'),
    YdestreetB: require('../assets/fonts/YdestreetB.otf'),
    YdestreetL: require('../assets/fonts/YdestreetL.otf'),
    PretendardBold: require('../assets/fonts/Pretendard-Bold.otf'),
    PretendardMedium: require('../assets/fonts/Pretendard-Medium.otf'),
    PretendardRegular: require('../assets/fonts/Pretendard-Regular.otf'),
    PretendardSemiBold: require('../assets/fonts/Pretendard-SemiBold.otf'),
    PretendardThin: require('../assets/fonts/Pretendard-Thin.otf'),
    PretendardLight: require('../assets/fonts/Pretendard-Light.otf'),
    PretendardExtraBold: require('../assets/fonts/Pretendard-ExtraBold.otf'),
    PretendardExtraLight: require('../assets/fonts/Pretendard-ExtraLight.otf'),
    PretendardBlack: require('../assets/fonts/Pretendard-Black.otf'),
  });

  if (!loaded) {
    // 폰트가 로드될 때까지 빈 화면 표시
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>{/* 추가된 부분 */}
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </GestureHandlerRootView>{/* 추가된 부분 */}
    </ThemeProvider>
  );
}
