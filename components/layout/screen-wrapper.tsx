import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '../../theme';
import { ScreenGradient } from '../ui/screen-gradient';

export function ScreenWrapper({ children, style }: { children: React.ReactNode, style?: any }) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScreenGradient />
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
}));
