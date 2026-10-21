import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
  View,
} from 'react-native';
import { makeStyles, typography, spacing, radius, useTheme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass, canUseGlass } from './glass';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  /** Use light-on-dark colors (e.g. over a camera preview or photo). */
  onDark?: boolean;
}

const HEIGHTS = { sm: 36, md: 48, lg: 54 } as const;
const SIZE_TEXT = {
  sm: { fontSize: typography.subhead.fontSize },
  md: { fontSize: typography.body.fontSize },
  lg: { fontSize: typography.headline.fontSize },
} as const;

const useStyles = makeStyles((c) => ({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  glassPress: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  text: { fontWeight: '600', textAlign: 'center' },
  smText: { fontSize: typography.subhead.fontSize },
  mdText: { fontSize: typography.body.fontSize },
  lgText: { fontSize: typography.headline.fontSize },
  primary: { backgroundColor: c.primary },
  primaryText: { color: c.onPrimary },
  secondary: { backgroundColor: c.fill },
  secondaryText: { color: c.textPrimary },
  outline: { backgroundColor: 'transparent', borderColor: c.border },
  outlineText: { color: c.textPrimary },
  danger: { backgroundColor: c.danger },
  dangerText: { color: '#FFFFFF' },
  disabled: { opacity: 0.45 },
  onDarkPrimary: { backgroundColor: '#FFFFFF' },
  onDarkSecondary: { backgroundColor: 'rgba(255,255,255,0.18)' },
}));

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  onDark = false,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const inactive = disabled || loading;

  // iOS 26+: native Liquid Glass. Colors are always decided in JS so the label stays
  // readable in both color schemes (never rely on the system 'auto' scheme here).
  if (canUseGlass()) {
    const prominent = variant === 'primary' || variant === 'danger';
    const glassTint = variant === 'danger' ? colors.danger : variant === 'primary' ? (onDark ? '#FFFFFF' : colors.primary) : undefined;
    const labelColor =
      variant === 'danger'
        ? '#FFFFFF'
        : variant === 'primary'
          ? onDark
            ? '#0A0A0A'
            : colors.onPrimary
          : onDark
            ? '#FFFFFF'
            : colors.textPrimary;

    return (
      <Glass
        isInteractive
        tintColor={glassTint}
        colorScheme={onDark ? 'dark' : undefined}
        style={[
          { height: HEIGHTS[size], borderRadius: radius.full, overflow: 'hidden', opacity: inactive ? 0.5 : 1 },
          style,
        ]}
      >
        <Pressable
          onPress={onPress}
          disabled={inactive}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={{ disabled: inactive, busy: loading }}
          style={[styles.glassPress, { paddingHorizontal: spacing.xl }]}
        >
          <View style={styles.row}>
            {loading ? (
              <ActivityIndicator color={labelColor} size="small" />
            ) : (
              <>
                {icon}
                <Text style={[styles.text, { color: labelColor, fontWeight: prominent ? '700' : '600' }, SIZE_TEXT[size], textStyle]}>
                  {title}
                </Text>
              </>
            )}
          </View>
        </Pressable>
      </Glass>
    );
  }

  // Android / fallback: solid pill
  const textVariant = onDark
    ? { color: variant === 'primary' ? '#0A0A0A' : '#FFFFFF' }
    : {
        primary: styles.primaryText,
        secondary: styles.secondaryText,
        outline: styles.outlineText,
        danger: styles.dangerText,
      }[variant];
  const sizeText = { sm: styles.smText, md: styles.mdText, lg: styles.lgText }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        { height: HEIGHTS[size], paddingHorizontal: spacing.xl },
        onDark && (variant === 'primary' ? styles.onDarkPrimary : styles.onDarkSecondary),
        inactive && styles.disabled,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {variant === 'primary' && !isDark && !onDark && (
        <LinearGradient
          pointerEvents="none"
          colors={colors.cardGradient as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.textPrimary} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, sizeText, textVariant, textStyle]}>{title}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}
