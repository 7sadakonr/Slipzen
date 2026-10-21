import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, radius, makeStyles, useTheme, AppColors } from '../../theme';

export type BannerVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';

export interface BannerProps {
  /** Optional title for the banner */
  title?: string;
  /** Primary message content */
  message: string;
  /** Semantic color preset */
  variant?: BannerVariant;
  /** Visibility toggle */
  visible?: boolean;
  /** Whether the user can tap an X icon to close */
  dismissable?: boolean;
  /** Callback fired when dismissed */
  onDismiss?: () => void;
  /** Optional call-to-action button */
  action?: {
    label: string;
    onPress: () => void;
  };
  /** Custom leading Ionicons name (pass null to hide icon) */
  icon?: keyof typeof Ionicons.glyphMap | null;
  /** Container style overrides */
  style?: StyleProp<ViewStyle>;
}

type BannerConfig = { bg: string; border: string; text: string; subtext: string; defaultIcon: keyof typeof Ionicons.glyphMap };

// Muted, ink-toned banners: neutral surface with a semantic icon/text accent.
const getVariantConfig = (colors: AppColors): Record<BannerVariant, BannerConfig> => ({
  info: {
    bg: colors.surface,
    border: colors.border,
    text: colors.textPrimary,
    subtext: colors.textSecondary,
    defaultIcon: 'information-circle',
  },
  success: {
    bg: colors.surface,
    border: colors.border,
    text: colors.success,
    subtext: colors.textSecondary,
    defaultIcon: 'checkmark-circle',
  },
  warning: {
    bg: colors.surface,
    border: colors.warning,
    text: colors.warning,
    subtext: colors.textSecondary,
    defaultIcon: 'warning',
  },
  error: {
    bg: colors.surface,
    border: colors.danger,
    text: colors.danger,
    subtext: colors.textSecondary,
    defaultIcon: 'alert-circle',
  },
  neutral: {
    bg: colors.surface,
    border: colors.borderLight,
    text: colors.textPrimary,
    subtext: colors.textSecondary,
    defaultIcon: 'notifications',
  },
});

export function Banner({
  title,
  message,
  variant = 'info',
  visible = true,
  dismissable = false,
  onDismiss,
  action,
  icon,
  style,
}: BannerProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const variants = getVariantConfig(colors);
  const config = variants[variant] || variants.info;
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: 250 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -12 }],
  }));

  const handleDismiss = () => {
    progress.value = withTiming(0, { duration: 200 }, () => {
      if (onDismiss) {
        runOnJS(onDismiss)();
      }
    });
  };

  if (!visible && progress.value === 0) {
    return null;
  }

  const iconName = icon === null ? null : (icon || config.defaultIcon);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={config.text}
            style={styles.leadingIcon}
          />
        )}

        <View style={styles.textContainer}>
          {title ? (
            <Text style={[styles.title, { color: config.text }]}>{title}</Text>
          ) : null}
          <Text style={[styles.message, { color: config.subtext }]}>
            {message}
          </Text>
        </View>

        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            activeOpacity={0.7}
            style={styles.actionBtn}
          >
            <Text style={[styles.actionText, { color: config.text }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}

        {dismissable && (
          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.dismissBtn}
          >
            <Ionicons name="close" size={18} color={config.text} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

export default Banner;

const useStyles = makeStyles((colors) => ({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  leadingIcon: {
    marginRight: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.headline,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    ...typography.subhead,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.fill,
  },
  actionText: {
    ...typography.caption1,
    fontWeight: '700',
  },
  dismissBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
}));
