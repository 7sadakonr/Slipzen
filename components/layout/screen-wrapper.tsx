import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';

export function ScreenWrapper({ children, style }: { children: React.ReactNode, style?: any }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS background color
  },
  container: {
    flex: 1,
  },
});
