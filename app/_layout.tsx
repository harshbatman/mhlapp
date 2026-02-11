import { AuthService } from '@/utils/auth';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import 'react-native-reanimated';

// Global error handler to remove Expo/Firebase references
if (!__DEV__) {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    Alert.alert(
      'Unexpected Error',
      'Something went wrong. Please restart the app or contact support if the problem persists.',
      [{ text: 'OK' }]
    );
  });
}

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    const syncAuth = async () => {
      const loggedIn = await AuthService.isLoggedIn();
      // segments.length === 0 means we are on the root index page
      const isRoot = segments.length === 0;
      const isAuthGroup = segments[0] === 'auth';

      if (loggedIn && (isRoot || isAuthGroup)) {
        // Redirect to tabs if logged in and on welcome/auth screens
        router.replace('/(tabs)');
      } else if (!loggedIn && segments[0] === '(tabs)') {
        // Redirect to welcome if not logged in and trying to access tabs
        router.replace('/');
      }
    };

    syncAuth();
  }, [segments, isReady]);

  useEffect(() => {
    // Small delay to allow navigation state to stabilize
    setTimeout(() => setIsReady(true), 100);
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth/login" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="auth/register" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false, headerShown: false }} />
        <Stack.Screen name="loan-details" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="profile" options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="edit-profile" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="delete-account" options={{ presentation: 'modal' }} />
        <Stack.Screen name="track-status" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
