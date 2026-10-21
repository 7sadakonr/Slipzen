import React from 'react';
import {
  View,
  Text,
  ActivityIndicator as RNActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { typography, spacing, radius, makeStyles, useTheme } from '../../theme';

export interface ActivityIndicatorProps {
  /** Controls visibility of indicator */
  visible?: boolean;
  /** Size of indicator: 'small', 'large', or numeric size */
  size?: 'small' | 'large' | number;
  /** Custom spinner color — defaults to theme primary */
  color?: string;
  /** 'inline' renders in standard flow, 'overlay' covers parent with blur backdrop */
  mode?: 'inline' | 'overlay';
  /** Optional message or status text shown below spinner */
  text?: string;
  /** Container style overrides */
  style?: StyleProp<ViewStyle>;
  /** Text style overrides */
  textStyle?: StyleProp<TextStyle>;
}

export function ActivityIndicator({
  visible = true,
  size = 'large',
  color,
  mode = 'inline',
  text,
  style,
  textStyle,
}: ActivityIndicatorProps) {
  const styles = useStyles();
  const { colors, isDark } = useTheme();
  const tint = color ?? colors.textPrimary;
  if (!visible) return null;

  if (mode === 'overlay') {
    return (
      <View style={[StyleSheet.absoluteFill, styles.overlay, style]} pointerEvents="auto">
        <BlurView intensity={25} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={styles.cardBox}>
          <RNActivityIndicator size={size} color={tint} />
          {text ? <Text style={[styles.text, textStyle]}>{text}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.inline, style]}>
      <RNActivityIndicator size={size} color={tint} />
      {text ? <Text style={[styles.text, textStyle]}>{text}</Text> : null}
    </View>
  );
}

// Support alias for user query ("ActivityIndex")
export const ActivityIndex = ActivityIndicator;
export type ActivityIndexProps = ActivityIndicatorProps;

export default ActivityIndicator;

const useStyles = makeStyles((colors) => ({
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  cardBox: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minWidth: 100,
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  text: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
}));
