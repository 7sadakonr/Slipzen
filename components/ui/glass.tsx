import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StyleProp, View, ViewStyle } from 'react-native';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '../../theme';

interface GlassProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'regular' is the default system glass, 'clear' is more transparent. */
  effect?: 'regular' | 'clear';
  tintColor?: string;
  isInteractive?: boolean;
  /** Force a color scheme (e.g. over camera previews). Defaults to the app's current scheme. */
  colorScheme?: 'light' | 'dark';
}

export function canUseGlass() {
  if (Platform.OS !== 'ios') return false;
  try {
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

/**
 * Native iOS 26 Liquid Glass surface. Falls back to a solid surface with a
 * hairline border on older iOS, Android, or when Reduce Transparency is on.
 */
export function Glass({
  children,
  style,
  effect = 'regular',
  tintColor,
  isInteractive,
  colorScheme,
}: GlassProps) {
  const { colors, isDark } = useTheme();
  // Always pass an explicit scheme from JS: native 'auto' can stay stuck on light
  // (e.g. in Expo Go) when the system appearance changes at runtime.
  const scheme = colorScheme ?? (isDark ? 'dark' : 'light');
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled?.()
      .then((v) => mounted && setReduceTransparency(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceTransparencyChanged', setReduceTransparency);
    return () => {
      mounted = false;
      sub?.remove();
    };
  }, []);

  if (canUseGlass() && !reduceTransparency) {
    return (
      <GlassView
        key={scheme}
        glassEffectStyle={effect}
        tintColor={tintColor}
        isInteractive={isInteractive}
        colorScheme={scheme}
        style={style}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
