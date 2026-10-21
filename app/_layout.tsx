import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider, DefaultTheme, DarkTheme } from 'expo-router';
import { lightColors, darkColors } from '../theme';
import { ToastHost } from '../components/ui/toast';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? darkColors : lightColors;
  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme : DefaultTheme).colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.surface,
      text: palette.textPrimary,
      border: palette.border,
    },
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect to dashboard if authenticated and inside auth group
      router.replace('/(tabs)');
    }
  }, [session, isInitialized, segments]);

  if (!isInitialized) return null; // Or a splash screen

  return (
    <ThemeProvider value={navTheme}>
    <StatusBar style="auto" />
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="expense" options={{ headerShown: false }} />
            <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
            <Stack.Screen
              name="notifications"
              options={{
                headerShown: true,
                title: 'Notifications',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: false,
                headerTintColor: palette.textPrimary,
                headerStyle: { backgroundColor: palette.background },
              }}
            />
            <Stack.Screen name="account" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen 
              name="add-actions" 
              options={{ 
                presentation: 'formSheet',
                headerShown: false,
                sheetGrabberVisible: true,
                sheetCornerRadius: 28,
                sheetAllowedDetents: [0.5],
                sheetExpandsWhenScrolledToEdge: false,
              }} 
            />
          </Stack>
        </BottomSheetModalProvider>
        <ToastHost />
      </QueryClientProvider>
    </GestureHandlerRootView>
    </ThemeProvider>
  );
}
