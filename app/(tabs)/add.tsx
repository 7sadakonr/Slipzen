import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import * as Haptics from 'expo-haptics';
import { getLastNonAddTab } from '../../lib/add-tab-state';
import { useTheme } from '../../theme';

/**
 * Fallback for the middle "Add" tab. Normally the touch interceptor in _layout.tsx
 * opens the Add sheet without ever selecting this tab; if it does get focus (e.g. via
 * VoiceOver), bounce back to the previous tab once and open the sheet.
 */
export default function AddBridge() {
  const { colors } = useTheme();
  const router = useRouter();
  const isFocused = useIsFocused();
  const lock = useRef(false);

  useEffect(() => {
    if (!isFocused || lock.current) return;
    lock.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const target = getLastNonAddTab();
    router.navigate((target === 'index' ? '/(tabs)' : `/(tabs)/${target}`) as any);
    // Not cleared on unmount/blur on purpose: navigating away blurs this screen immediately,
    // and the sheet still has to open afterwards.
    setTimeout(() => router.push('/add-actions'), 100);
    setTimeout(() => {
      lock.current = false;
    }, 1000);
  }, [isFocused]);

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
