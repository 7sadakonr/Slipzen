import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, spacing, useTheme } from '../../theme';

interface GraphiteCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  padding?: number;
}

/**
 * Dark graphite "bank card": diagonal gradient, soft sheen and translucent rings.
 * Always dark in both color schemes, so content on it should use white text.
 */
export function GraphiteCard({ children, style, radius = 28, padding = spacing['2xl'] }: GraphiteCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={[styles.shadow, { borderRadius: radius }, style]}>
      <LinearGradient
        colors={colors.cardGradient as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderRadius: radius, padding }]}
      >
        {/* decorative rings, clipped by the card */}
        <View pointerEvents="none" style={styles.ringLarge} />
        <View pointerEvents="none" style={styles.ringSmall} />
        {/* top-left sheen */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0.7 }}
          style={styles.sheen}
        />
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ringLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -90,
    top: -110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  ringSmall: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -30,
    bottom: -70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: { position: 'relative' },
}));
