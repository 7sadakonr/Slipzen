import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface BlurHeaderProps {
  children: React.ReactNode;
  /** Total height (status bar + content). Use it as top padding of the scrolling content. */
  onHeight?: (height: number) => void;
}

/** How far the blur keeps fading below the header content, in px. */
const FADE = 36;
/** Fraction of the header height that stays fully blurred before the fade starts. */
const SOLID_FRACTION = 0.55;

/**
 * Floating header with a smooth progressive blur: one blur layer, masked by a gradient so it is
 * strongest at the top and fades to completely clear below the header. No tint, no hard edges.
 * Place it inside a screen and pad the scroll content by the reported height.
 */
export function BlurHeader({ children, onHeight }: BlurHeaderProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);

  const total = height + FADE;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingTop: insets.top }]}
      onLayout={(e) => {
        setHeight(e.nativeEvent.layout.height);
        onHeight?.(e.nativeEvent.layout.height);
      }}
    >
      {height > 0 &&
        (Platform.OS === 'ios' ? (
          <MaskedView
            pointerEvents="none"
            style={[styles.effect, { height: total }]}
            maskElement={
              <LinearGradient
                // alpha is what matters for a mask: opaque -> transparent
                colors={['#000', '#000', 'rgba(0,0,0,0)']}
                locations={[0, (height * SOLID_FRACTION) / total, 1]}
                style={StyleSheet.absoluteFill}
              />
            }
          >
            <BlurView intensity={70} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          </MaskedView>
        ) : (
          // No blur on Android: just keep the header readable over scrolling content
          <LinearGradient
            pointerEvents="none"
            colors={[colors.background, colors.background, 'transparent']}
            locations={[0, height / total, 1]}
            style={[styles.effect, { height: total }]}
          />
        ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  effect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
