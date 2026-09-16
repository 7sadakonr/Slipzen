import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import * as Haptics from 'expo-haptics';
import { getLastNonAddTab } from '../../lib/add-tab-state';
import { colors } from '../../theme';

export default function AddBridge() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const lock = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isFocused && !lock.current) {
      lock.current = true;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      
      const target = getLastNonAddTab();
      // Ensure we route properly using expo-router's path resolution
      const targetPath = target === 'index' ? '/(tabs)' : `/(tabs)/${target}`;
      
      // 1. Immediately attempt to switch back to previous tab
      router.navigate(targetPath as any);
      
      // 2. Aggressive Bounce Back: 
      interval = setInterval(() => {
        router.navigate(targetPath as any);
      }, 50);
      
      // 3. Push modal after a slight delay
      setTimeout(() => {
        router.push('/add-actions');
        
        setTimeout(() => {
          lock.current = false;
        }, 1500);
      }, 100);
    }

    // Cleanup: This runs when isFocused becomes false
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocused]);

  // Use the app's background color to avoid a harsh white flash
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
