import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme';
import { setLastNonAddTab } from '../../lib/add-tab-state';

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Handle paths to track last tab
  let currentTab = 'index';
  const parts = pathname.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];
  if (lastPart && lastPart !== '(tabs)') {
    currentTab = lastPart;
  }
  if (currentTab !== 'add') {
    setLastNonAddTab(currentTab);
  }

  return (
    <View style={{ flex: 1 }}>
      <NativeTabs
        tintColor={colors.primary}
        shadowColor="transparent"
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="transactions">
          <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="list.bullet" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="add">
          <NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="plus" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="analytics">
          <NativeTabs.Trigger.Label>Analytics</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
        </NativeTabs.Trigger>
      </NativeTabs>

      {/* 
        INVISIBLE TOUCH INTERCEPTOR 
        This transparent view sits perfectly over the middle 'add' tab.
        It intercepts the user's tap BEFORE it reaches the Native Tab Bar,
        preventing the tab from being visually selected (turning blue),
        while still preserving the 100% native Liquid Glass look underneath!
      */}
      <View style={styles.touchInterceptorContainer} pointerEvents="box-none">
        <TouchableOpacity 
          style={{ width: '22%', height: 49 + insets.bottom }}
          activeOpacity={1} // Keep it totally invisible when pressed
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.push('/add-actions');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  touchInterceptorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 999,
  }
});
