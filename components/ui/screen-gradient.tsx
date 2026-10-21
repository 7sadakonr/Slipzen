import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

/** Very faint full-screen backdrop. Render it first inside a screen; content sits on top. */
export function ScreenGradient() {
  const { colors } = useTheme();
  return (
    <LinearGradient
      pointerEvents="none"
      colors={colors.screenGradient as unknown as [string, string, ...string[]]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}
